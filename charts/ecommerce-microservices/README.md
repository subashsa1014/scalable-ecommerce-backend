# ecommerce-microservices Helm Chart

Usage:

1. Set images and secrets in `values.yaml` (or pass via `--set`).
2. Install:

```bash
helm install my-ecommerce ./charts/ecommerce-microservices -n ecommerce --create-namespace
```

3. To uninstall:

```bash
helm uninstall my-ecommerce -n ecommerce
```

Notes:
- Replace `yourregistry/<service>:latest` placeholders with your real images.
- This chart is parameterized per-service by setting `.Values.serviceName`. To deploy multiple services as separate releases, deploy the chart once per service with `--set serviceName=api-gateway` etc.
