# Secrets Management with Google Secret Manager + External Secrets Operator

This tutorial covers the production pattern for managing secrets on GKE: **GSM as the source of truth, synced into Kubernetes by External Secrets Operator (ESO)**.

The goal is to eliminate raw secret values from your repo, CI/CD pipelines, and kubectl commands entirely.

---

## How It Works

```
Google Secret Manager
        │
        │  (ESO fetches on schedule)
        ▼
External Secrets Operator  (runs in cluster)
        │
        │  (creates/updates)
        ▼
   Kubernetes Secret
        │
        │  (mounted as env var)
        ▼
     Your Pod
```

Your app code never changes — it still reads env vars. The only difference is that the k8s Secret is created automatically by ESO instead of manually by you.

---

## Prerequisites

- A GKE cluster with Workload Identity enabled
- `kubectl` configured against your cluster
- `helm` installed locally
- The GCP project ID where your cluster lives

---

## Step 1: Create the Secret in GSM

In the [GCP Console](https://console.cloud.google.com/security/secret-manager):

1. Navigate to **Secret Manager**
2. Click **Create Secret**
3. Name it `todo-db-password`
4. Paste in your database password as the value
5. Click **Create**

Or via `gcloud`:

```bash
echo -n "your-db-password" | gcloud secrets create todo-db-password \
  --data-file=- \
  --project=YOUR_PROJECT_ID
```

To update it later (creates a new version, old one is retained):

```bash
echo -n "new-password" | gcloud secrets versions add todo-db-password \
  --data-file=- \
  --project=YOUR_PROJECT_ID
```

---

## Step 2: Install External Secrets Operator

ESO is installed once per cluster via Helm:

```bash
helm repo add external-secrets https://charts.external-secrets.io
helm repo update

helm install external-secrets external-secrets/external-secrets \
  --namespace external-secrets \
  --create-namespace
```

Verify it's running:

```bash
kubectl get pods -n external-secrets
```

---

## Step 3: Configure Workload Identity

ESO needs a GCP service account with permission to read secrets, linked to its Kubernetes service account via Workload Identity. This avoids any key files.

```bash
PROJECT_ID=YOUR_PROJECT_ID
CLUSTER_NAME=YOUR_CLUSTER_NAME

# Create a GCP service account for ESO
gcloud iam service-accounts create eso-secret-reader \
  --project=$PROJECT_ID

# Grant it access to read secrets
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:eso-secret-reader@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# Bind it to ESO's Kubernetes service account
gcloud iam service-accounts add-iam-policy-binding \
  eso-secret-reader@${PROJECT_ID}.iam.gserviceaccount.com \
  --role="roles/iam.workloadIdentityUser" \
  --member="serviceAccount:${PROJECT_ID}.svc.id.goog[external-secrets/external-secrets]"

# Annotate the k8s service account
kubectl annotate serviceaccount external-secrets \
  --namespace external-secrets \
  iam.gke.io/gcp-service-account=eso-secret-reader@${PROJECT_ID}.iam.gserviceaccount.com
```

---

## Step 4: Create a ClusterSecretStore

A `ClusterSecretStore` tells ESO where to find secrets (GCP project, auth method). It's cluster-scoped so all namespaces can use it.

```yaml
# k8s/cluster-secret-store.yaml
apiVersion: external-secrets.io/v1beta1
kind: ClusterSecretStore
metadata:
  name: gcp-secret-store
spec:
  provider:
    gcpsm:
      projectID: YOUR_PROJECT_ID
```

```bash
kubectl apply -f k8s/cluster-secret-store.yaml
```

This is a one-time setup per cluster. Every app you deploy after this just references `gcp-secret-store` by name.

---

## Step 5: Create an ExternalSecret for Your App

This resource tells ESO which GSM secret to fetch and what k8s Secret to create from it:

```yaml
# k8s/external-secret.yaml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: odewahn-todo-app-db-secret
  namespace: odewahn-todo-app
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: gcp-secret-store
    kind: ClusterSecretStore
  target:
    name: odewahn-todo-app-db-secret   # the k8s Secret it will create
    creationPolicy: Owner
  data:
    - secretKey: db-password           # key inside the k8s Secret
      remoteRef:
        key: todo-db-password          # name of the secret in GSM
        version: latest
```

```bash
kubectl apply -f k8s/external-secret.yaml
```

ESO will immediately fetch the secret from GSM and create the k8s Secret. After that it re-syncs every hour.

Check that it worked:

```bash
kubectl get externalsecret -n odewahn-todo-app
kubectl get secret odewahn-todo-app-db-secret -n odewahn-todo-app
```

---

## Step 6: Remove secret.yaml

Now that ESO manages the k8s Secret, delete `k8s/secret.yaml` and `k8s/secret.yaml.example` from the repo. The secret is created automatically on deploy.

If you committed `secret.yaml` previously, make sure it's in `.gitignore`.

---

## What Stays the Same

Your `backend-deployment.yaml` doesn't change at all — it still reads:

```yaml
- name: DB_PASSWORD
  valueFrom:
    secretKeyRef:
      name: odewahn-todo-app-db-secret
      key: db-password
```

The k8s Secret has the same name and key. The only difference is ESO creates it instead of you.

---

## Day-to-Day Workflow

**Adding a new secret:**
1. Create it in GSM (Console or `gcloud`)
2. Add an entry under `data:` in `external-secret.yaml`
3. Reference it in your deployment as an env var

**Rotating a secret:**
1. Add a new version in GSM
2. ESO picks it up within `refreshInterval` (1h by default)
3. Pod restarts on the next deploy to get the new value (or trigger a rollout manually)

**Sharing a secret across services:**
Each service has its own `ExternalSecret` pointing at the same GSM secret. No copy-pasting values between manifests.

---

## Further Reading

- [External Secrets Operator docs](https://external-secrets.io/latest/)
- [GCP Workload Identity docs](https://cloud.google.com/kubernetes-engine/docs/how-to/workload-identity)
- [Secret Manager best practices](https://cloud.google.com/secret-manager/docs/best-practices)
