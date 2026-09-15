# TMail service hardening

`tmail-app.service` is an internet-facing Next.js process and must run with the
`95-security-hardening.conf` drop-in installed. The sandbox deliberately blocks
privilege-gaining executables, access to user homes and cron spools, and
execution from temporary directories. The application filesystem is read-only
except for `.next/cache`.

After deployment, verify with:

```sh
systemctl daemon-reload
systemctl restart tmail-app.service
systemctl is-active tmail-app.service
systemd-analyze security tmail-app.service
curl -fsS http://127.0.0.1:3100/ >/dev/null
```
