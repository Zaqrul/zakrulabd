# Security operations

The only write endpoint in this repository is `POST /api/contact`. It has
same-origin request checks, a bounded multipart body, field and attachment
validation, and a process-local rate limit. Process memory is not shared among
Vercel function instances, so the application limit is only a backstop.

## Vercel Firewall rollout

Once this repository is linked to the production Vercel project, add a Custom
Rule in **Firewall** with both conditions:

- Request Path equals `/api/contact`
- Request Method equals `POST`

Choose **Rate Limit**, count by **IP**, use a **10 minute** fixed window, and
start with **20 requests** and **Log** as the action. Publish the log rule and
review the matching traffic and legitimate contact-form submissions. If the
matches are abusive, change the action to **Rate Limit (429)** and reduce the
threshold toward **5 requests per 10 minutes**. Review the rule again after
publication. Vercel Hobby permits one rate-limit rule per project, so this
endpoint is the priority.

To manage the project from the terminal, authenticate with the Vercel CLI and
link the correct project before staging rules. Do not publish a deny or
challenge rule without reviewing the rule's matches first.

## Incident checks

The source repository alone cannot establish whether a live deployment was
compromised. Compare the production deployment's commit with this repository,
review Vercel Runtime Logs and Firewall traffic for the affected host and
`/api/contact`, and inspect unexpected external script requests in a browser.
If unauthorized code or credentials are found, deploy a clean commit and rotate
the affected keys. The script CSP remains report-only until real production
violations have been reviewed; the enforced policy currently covers embedding,
objects, base URLs, and form destinations.
