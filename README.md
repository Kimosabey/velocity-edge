# VelocityEdge

![Performance](docs/assets/performance.png)

## High-Performance Edge Caching

<div align="center">

![Status](https://img.shields.io/badge/Status-Production_Ready-success?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)
![Engine](https://img.shields.io/badge/Engine-Varnish_Cache-4A90E2?style=for-the-badge)

</div>

**VelocityEdge** demonstrates how to achieve **Sub-Millisecond Latency** for API endpoints using **L7 Edge Caching**. By placing Varnish Configuration Language (VCL) logic in front of a Node.js backend, it reduces response times by 99% and protects the database from "Thundering Herd" traffic spikes.

---

## 🚀 Quick Start

Run the infrastructure:

```bash
# Start Varnish and Backend
docker-compose up -d --build
```
> **Ports**: Varnish (:8081), Backend (:3000), Dashboard (:5173).

---

## 📸 Demo & Architecture

### Real-Time Dashboard
![Dashboard](docs/assets/dashboard-preview.png)
*Compare "Direct" vs "Edge" latency in real-time.*

### Architecture Flow
![System Flow](docs/assets/sytem-flow.png)
*Client -> Varnish (Hit?) -> Node.js -> DB*

### Cache Logic
![Cache Flow](docs/assets/cache-flow.png)
*Visualizing the VCL decision tree (Receive -> Lookup -> Deliver)*

> **Deep Dive**: See [ARCHITECTURE.md](./docs/ARCHITECTURE.md) for the VCL script.

---

## ✨ Key Features

*   **⚡ 1ms Response Times**: Delivers content from RAM, bypassing the application loop.
*   **🛡️ Thundering Herd Protection**: Coalesces concurrent requests to spare the Database.
*   **🧟 Grace Mode**: Serves "Stale" content if the backend crashes (Automatic High Availability).
*   **🧠 Programmable Edge**: Uses VCL to strip cookies, rewrite headers, and route traffic.

---

## 📚 Documentation

| Document | Description |
| :--- | :--- |
| [**Architecture Guide**](./docs/ARCHITECTURE.md) | VCL Logic, Key Patterns, and Decision Log. |
| [**Getting Started**](./docs/GETTING_STARTED.md) | Setup guide and Benchmarking scripts. |
| [**Failure Scenarios**](./docs/FAILURE_SCENARIOS.md) | Grace Mode and Backend Kill tests. |
| [**Interview Q&A**](./docs/INTERVIEW_QA.md) | "Varnish vs Redis" and "Cache Invalidation". |

---

## 🔧 Tech Stack

| Component | Technology | Role |
| :--- | :--- | :--- |
| **Edge Engine** | **Varnish Cache 7** | Reverse Proxy & Caching. |
| **Backend** | **Node.js** | Simulated API. |
| **Dashboard** | **React + Vite** | Metrics Visualization. |
| **Ops** | **Docker Compose** | Orchestration. |

---

## 👤 Author

**Harshan Aiyappa**  
Senior Full-Stack Hybrid Engineer  
[GitHub Profile](https://github.com/Kimosabey)

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
