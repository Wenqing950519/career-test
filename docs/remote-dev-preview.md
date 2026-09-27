# VPS 私有開發預覽

這份流程用於 `career-test` 的開發環境。Windows 與 VPS 需先加入同一個有存取權的 Tailscale Tailnet；網站仍只在 VPS 的 loopback 介面啟動。

在 VPS 的專案目錄執行，將範例網域換成 `tailscale status --json` 中 `Self.DNSName` 的值（去除結尾的 `.`）：

```bash
NODE_OPTIONS=--dns-result-order=ipv4first \
  __VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS=devbox.example.ts.net \
  npm run dev
```

另開終端，確認 `http://127.0.0.1:3000/quiz` 可讀取，再啟用 Tailnet 內的 HTTPS 代理：

```bash
sudo tailscale serve --bg 3000
sudo tailscale serve status
```

在已加入 Tailnet 的 Windows 瀏覽器，用 `tailscale serve status` 顯示的 HTTPS 網址開啟 `/quiz` 和 `/resume`。結束預覽後執行：

```bash
sudo tailscale serve --https=443 off
```

Vinext/Vite 8 在本次環境預設將 `localhost` 解析到 `::1`，但 Tailscale Serve 的 `3000` 目標連至 `127.0.0.1`；`NODE_OPTIONS` 讓兩者使用相同的 IPv4 loopback。Vite 會拒絕未列入允許清單的 Tailnet hostname，因此需設定上述環境變數。這些設定只作用於本次 dev server 程序，不需修改應用程式碼或公開埠。不要使用 Tailscale Funnel 發布這個預覽。
