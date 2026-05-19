# Architecture & Logic Samples

This repository contains isolated, production-grade logic samples from various professional applications. Due to non-disclosure agreements (NDAs), the full source code of these proprietary systems cannot be shared. 

The snippets provided here demonstrate my architectural approach to building type-safe, performant, and secure full-stack software.

---

## Project 1: Pulse Data Analytics
**Stack:** Angular, D3.js, TypeScript

An industrial IoT monitoring dashboard engineered to visualize real-time, high-frequency sensor streams without impacting UI responsiveness.

### Featured Logic: Hybrid D3/Angular Real-Time Chart
* **The Challenge:** Bridging the gap between Angular's declarative change detection and D3.js's imperative DOM manipulation without triggering memory leaks or layout thrashing during sub-second updates.
* **The Solution:** A decoupled architecture where Angular strictly manages the component lifecycle and input bindings, while passing raw data to a scoped, hardware-accelerated D3 execution context using smooth transition-joins.
* **File Location:** `frontend/src/app/pulse-analytics/realtime-chart.component.ts`

---

## Project 2: Nexus Task Orchestrator
**Stack:** Node.js (Express), TypeScript, MongoDB, Docker

An enterprise task orchestration platform built with a focus on defense-in-depth security, low-latency API routing, and single-command local infrastructure setups.

### Featured Logic 1: Lightweight JWT Authentication Middleware
* **The Challenge:** Protecting user-specific endpoints from cross-tenant data leaks without choking the API with recurrent database session lookups on every request.
* **The Solution:** An inline, stateless Express middleware that extracts cryptographically signed JWT payloads, verifies tenancy context on the fly, and injects strongly typed context models into the downstream handler.
* **File Location:** `backend/src/middleware/auth.middleware.ts`

### Featured Logic 2: Isolated Multi-Tier Docker Orchestration
* **The Challenge:** Simplifying localized developer onboarding while completely isolating sensitive database boundaries from internet-facing client applications.
* **The Solution:** A production-ready multi-network docker-compose specification that builds containers on isolated software-defined subnets, shielding the stateful layers from non-vetted incoming traffic.
* **File Location:** `docker-compose.yml`

---

## Shared Tooling & Framework Agnostic Logic

### Generic Type-Safe API Client
* **The Challenge:** Managing network requests across dynamic views without duplicating header setups, global timeout routines, or losing generic return type safety.
* **The Solution:** A unified, production-tested wrapper leveraging TypeScript generics that handles interceptors, centralizes session degradation traps (like HTTP 401 triggers), and handles low-level error boundaries.
* **File Location:** `shared/utils/api-client.ts`

---

## Repository Structure

To explore the exact implementation of these solutions, navigate through the source directories:

```text
├── docker-compose.yml           # Nexus Infrastructure Sample
├── frontend/
│   └── realtime-chart.ts        # Pulse D3/Angular Hybrid Component
├── backend/
│   └── auth.middleware.ts       # Nexus Route Security Layer
└── shared/
    └── api-client.ts            # Shared Abstract Tooling
