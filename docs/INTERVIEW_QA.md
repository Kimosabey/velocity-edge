# 🎤 Interview Cheat Sheet: VelocityEdge

## 1. The Elevator Pitch (2 Minutes)

"VelocityEdge is a demonstration of **L7 Edge Caching** using Varnish.

In high-scale systems, the Database is always the bottleneck.
I solved this by placing a programmable Reverse Proxy (Varnish) in front of the API.
It handles three critical things:
1.  **Latency**: Drops response times from 500ms to 1ms.
2.  **Protection**: Uses 'Request Coalescing' to stop traffic spikes from killing the DB.
3.  **Resilience**: Uses 'Grace Mode' to keep the site up even if the backend crashes."

---

## 2. "Explain Like I'm 5" (The Pizza Shop)

"Imagine a Pizza Shop (The API).
*   **The Problem**: Every customer asks 'Do you have Pepperoni?'. The Chemist checks the fridge (Database) every single time. It takes 5 minutes.
*   **My Solution**: I put a Guy at the Front Counter (Varnish).
    *   The first time someone asks, he yells to the Chef.
    *   For the next 10 minutes, he just remembers the answer.
    *   He tells the next 100 people 'Yes' instantly without bothering the Chef."

---

## 3. Tough Technical Questions

### Q: Why Varnish over Redis?
**A:** "Redis is a **Data Store**. You have to change your application code to check Redis.
Varnish is a **HTTP Accelerator**. It sits *in front* of your application.
*   **Zero Code Change**: My API doesn't know Varnish exists.
*   **Handling Headers**: Varnish understands HTTP (ETags, Cookies, Ages) natively. Redis is just a key-value store."

### Q: How do you handle cache invalidation?
**A:** "There are two hard things in CS, right?
1.  **TTL (Time To Live)**: For most data, a 60-second consistency lag is acceptable.
2.  **Purge/Ban**: For critical updates (e.g., Price Change), the application sends a `PURGE` HTTP request to Varnish, effectively deleting the cached object instantly."

### Q: Does this work with HTTPS?
**A:** "Varnish Open Source does **not** support HTTPS (by design). In production, I would place an **SSL Termination Proxy** (like Nginx or AWS ALB) in front of Varnish to handle the encryption, while Varnish handles the logic."
