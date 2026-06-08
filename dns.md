# SwifTek DNS Records

## TXT — SPF (Email Sender Policy)

```
swiftek.onrender.com  TXT  "v=spf1 include:_spf.google.com ~all"
```

Adjust `include:_spf.google.com` if switching to a different email provider. The `~all` is a soft fail — marks unapproved senders but doesn't reject them.
