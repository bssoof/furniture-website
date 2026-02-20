# Release Playbook

## Gradual Rollout
1. Publish to staging and run `npm run quality`.
2. Deploy to production during low-traffic hours.
3. Monitor conversion events for first 60 minutes.
4. Keep previous deployment artifact for instant rollback.

## 7-Day Monitoring
- Daily check of `view_product`, `add_to_cart`, `begin_checkout`, `submit_order_whatsapp`.
- Daily scan for broken links and asset errors.
- Track checkout success rate and WhatsApp click-through.

## Rollback Plan
1. If checkout conversion drops by 30%+ or JS runtime errors spike, rollback immediately.
2. Restore previous artifact and clear CDN cache.
3. Re-run smoke checks (`check:assets`, `check:a11y`, unit tests).
4. Patch and redeploy via staging gate.
