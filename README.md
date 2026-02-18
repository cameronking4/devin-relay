# Relay

**Event-driven AI orchestration for engineering signals.**

Modern dev tools emit webhooks. AI systems reason—but don't natively integrate with those signals. Relay closes the loop.

Connect a webhook. Trigger Devin. Route outputs to GitHub. **Zero glue code.**

![Relay — AI orchestration for engineering signals](https://www.launchmvpfast.com/og.png)

---

## The problem

Every team building AI automation writes the same boilerplate:

- Host webhook endpoints
- Validate signatures, dedupe deliveries
- Transform payloads into prompts
- Orchestrate AI sessions
- Handle retries, concurrency, timeouts
- Post results back to GitHub
- Build audit logs for visibility

**Relay does all of this.** So you focus on prompts and product, not plumbing.

---

## What Relay delivers

**Event → Context Binding → Prompt Rendering → Devin Session → Structured Action**

- **Native GitHub integration** — `pull_request.opened`, `pull_request.synchronize`, `issue_comment.created`
- **Generic webhooks** — JSON POST, unique URL per trigger, optional HMAC, schema introspection
- **BYOK Devin** — your API key, encrypted at rest, never logged
- **Full visibility** — raw payload, rendered prompt, Devin output, latency, errors for every execution

Not a chatbot. Not a PR bot. Not a Zapier clone. **Relay is the beginning of an AI control plane.**

---

## Who it's for

- **Platform engineers** shipping internal tooling
- **DevEx teams** automating code review and feedback loops
- **AI-forward startups** (10–200 engineers) experimenting with automation

If you use GitHub and modern SaaS tooling—and you'd rather not maintain glue code—Relay is built for you.

See [`apps/saas/README.md`](apps/saas/README.md) for environment setup and local development.

---

## Stack

- **Next.js** (App Router, latest) + **TypeScript**
- **PostgreSQL** (Prisma/Drizzle) + **Redis** (BullMQ)
- **Devin** (BYOK) + **GitHub** (App installation)
- **Vercel** (frontend/API) + worker for background jobs

---

## Monorepo structure

```
apps/
├── saas/          # Relay product — projects, triggers, executions
├── www/           # Marketing site
└── webhook-mock-demo/  # Webhook testing demo
```

---

## License

[MIT](LICENSE.md)
