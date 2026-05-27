const API_BASE = "https://crm-ticket-system-production-17f2.up.railway.app";

const state = {
    tickets: [],
    filtered: []
};

const views = {
    home: document.getElementById("view-home"),
    create: document.getElementById("view-new"),
    detail: document.getElementById("view-detail")
};

const ticketList = document.getElementById("ticketList");
const ticketCount = document.getElementById("ticketCount");
const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const formMessage = document.getElementById("formMessage");
const detailContent = document.getElementById("detailContent");
const detailTitle = document.getElementById("detailTitle");

function showView(name) {
    views.home.classList.add("hidden");
    views.create.classList.add("hidden");
    views.detail.classList.add("hidden");
    views[name].classList.remove("hidden");
}

function normalizeStatus(raw) {
    const value = String(raw || "open").toLowerCase();
    if (value.includes("close")) return "closed";
    if (value.includes("progress")) return "progress";
    return "open";
}

function statusLabel(status) {
    const s = normalizeStatus(status);
    if (s === "closed") return "Closed";
    if (s === "progress") return "Progress";
    return "Open";
}

function escapeHtml(text) {
    return String(text ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function applyFilters() {
    const q = searchInput.value.trim().toLowerCase();
    const status = statusFilter.value;

    state.filtered = state.tickets.filter((ticket) => {
        const ticketStatus = normalizeStatus(ticket.status);
        const inStatus = status === "all" || status === ticketStatus;
        const haystack = [
            ticket.ticket_id,
            ticket.subject,
            ticket.customer_name,
            ticket.customer_email,
            ticket.description
        ].join(" ").toLowerCase();
        const inSearch = !q || haystack.includes(q);
        return inStatus && inSearch;
    });

    renderTicketList();
}

function renderTicketList() {
    if (!state.filtered.length) {
        ticketList.innerHTML = "<div class='muted'>No tickets found.</div>";
        ticketCount.textContent = "0 ticket(s)";
        return;
    }

    ticketCount.textContent = `${state.filtered.length} ticket(s)`;
    ticketList.innerHTML = state.filtered.map((ticket) => {
        const id = escapeHtml(ticket.ticket_id || "N/A");
        const subject = escapeHtml(ticket.subject || "(No subject)");
        const customer = escapeHtml(ticket.customer_name || "Unknown customer");
        const email = escapeHtml(ticket.customer_email || "-");
        const createdAt = ticket.created_at ? new Date(ticket.created_at).toLocaleString() : "-";
        return `
            <article class="ticket-item">
                <div class="ticket-top">
                    <strong>${id} - ${subject}</strong>
                    <span class="pill">${statusLabel(ticket.status)}</span>
                </div>
                <div class="muted">${customer} (${email})</div>
                <div class="muted">Created: ${escapeHtml(createdAt)}</div>
                <div>
                    <a class="btn" href="#/ticket/${encodeURIComponent(ticket.ticket_id)}">View detail</a>
                </div>
            </article>
        `;
    }).join("");
}

async function loadTickets() {
    ticketCount.textContent = "Loading tickets...";
    try {
        const res = await fetch(`${API_BASE}/api/tickets`);
        if (!res.ok) throw new Error("Could not load tickets");
        const data = await res.json();
        state.tickets = Array.isArray(data) ? data : [];
        applyFilters();
    } catch (error) {
        ticketList.innerHTML = `<div class="message err">${escapeHtml(error.message)}</div>`;
        ticketCount.textContent = "Error loading tickets";
    }
}

async function createTicket(event) {
    event.preventDefault();
    formMessage.innerHTML = "";

    const payload = {
        customer_name: document.getElementById("customerName").value.trim(),
        customer_email: document.getElementById("customerEmail").value.trim(),
        subject: document.getElementById("subject").value.trim(),
        description: document.getElementById("description").value.trim()
    };

    try {
        const res = await fetch(`${API_BASE}/api/tickets`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const maybeError = await res.text();
            throw new Error(maybeError || "Ticket creation failed");
        }

        const created = await res.json();
        formMessage.innerHTML = `<div class="message ok">Ticket ${escapeHtml(created.ticket_id || "created")} created successfully.</div>`;
        event.target.reset();
        await loadTickets();
    } catch (error) {
        formMessage.innerHTML = `<div class="message err">${escapeHtml(error.message)}</div>`;
    }
}

async function showTicketDetail(ticketId) {
    showView("detail");
    detailTitle.textContent = `Ticket ${ticketId}`;
    detailContent.innerHTML = "<div class='muted'>Loading ticket detail...</div>";

    try {
        const res = await fetch(`${API_BASE}/api/tickets/${encodeURIComponent(ticketId)}`);
        if (!res.ok) throw new Error("Ticket not found");
        const ticket = await res.json();

        const notes = Array.isArray(ticket.notes) ? ticket.notes : [];
        const currentStatus = normalizeStatus(ticket.status);
        detailContent.innerHTML = `
            <div class="kv"><strong>Ticket ID</strong><span>${escapeHtml(ticket.ticket_id || "-")}</span></div>
            <div class="kv"><strong>Status</strong><span>${statusLabel(ticket.status)}</span></div>
            <div class="kv"><strong>Customer</strong><span>${escapeHtml(ticket.customer_name || "-")}</span></div>
            <div class="kv"><strong>Email</strong><span>${escapeHtml(ticket.customer_email || "-")}</span></div>
            <div class="kv"><strong>Subject</strong><span>${escapeHtml(ticket.subject || "-")}</span></div>
            <div class="kv"><strong>Description</strong><span>${escapeHtml(ticket.description || "-")}</span></div>
            <div class="kv"><strong>Created</strong><span>${ticket.created_at ? escapeHtml(new Date(ticket.created_at).toLocaleString()) : "-"}</span></div>
            <div class="kv"><strong>Updated</strong><span>${ticket.updated_at ? escapeHtml(new Date(ticket.updated_at).toLocaleString()) : "-"}</span></div>
            <div class="notes">
                <strong>Notes</strong>
                ${notes.length ? notes.map((n) => `<div class="ticket-item" style="margin-top: 8px;"><div>${escapeHtml(n.note_text || "")}</div><div class="muted">${n.created_at ? escapeHtml(new Date(n.created_at).toLocaleString()) : ""}</div></div>`).join("") : "<div class='muted' style='margin-top: 8px;'>No notes yet.</div>"}
            </div>
            <form id="ticketUpdateForm" class="notes">
                <strong>Update Ticket</strong>
                <input id="detailTicketId" type="hidden" value="${escapeHtml(ticket.ticket_id || "")}" />
                <div class="row" style="margin-top: 8px;">
                    <select id="detailStatus" required>
                        <option value="open" ${currentStatus === "open" ? "selected" : ""}>Open</option>
                        <option value="progress" ${currentStatus === "progress" ? "selected" : ""}>Progress</option>
                        <option value="closed" ${currentStatus === "closed" ? "selected" : ""}>Closed</option>
                    </select>
                    <div></div>
                </div>
                <textarea id="detailNote" placeholder="Add a note (optional)"></textarea>
                <div style="margin-top: 10px;">
                    <button class="btn primary" type="submit">Save Changes</button>
                </div>
                <div id="detailMessage"></div>
            </form>
        `;
    } catch (error) {
        detailContent.innerHTML = `<div class="message err">${escapeHtml(error.message)}</div>`;
    }
}

async function updateTicket(event) {
    event.preventDefault();

    const ticketId = document.getElementById("detailTicketId")?.value;
    const status = document.getElementById("detailStatus")?.value;
    const noteText = document.getElementById("detailNote")?.value.trim() || "";
    const detailMessage = document.getElementById("detailMessage");

    if (!ticketId || !status || !detailMessage) return;
    detailMessage.innerHTML = "";

    try {
        const res = await fetch(`${API_BASE}/api/tickets/${encodeURIComponent(ticketId)}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                status,
                notes: noteText || null
            })
        });

        if (!res.ok) {
            const maybeError = await res.text();
            throw new Error(maybeError || "Update failed");
        }

        detailMessage.innerHTML = `<div class="message ok">Ticket updated.</div>`;
        await loadTickets();
        await showTicketDetail(ticketId);
    } catch (error) {
        detailMessage.innerHTML = `<div class="message err">${escapeHtml(error.message)}</div>`;
    }
}

function route() {
    const hash = window.location.hash || "#/";

    if (hash === "#/new") {
        showView("create");
        return;
    }

    if (hash.startsWith("#/ticket/")) {
        const ticketId = decodeURIComponent(hash.replace("#/ticket/", ""));
        if (ticketId) {
            showTicketDetail(ticketId);
            return;
        }
    }

    showView("home");
}

searchInput.addEventListener("input", applyFilters);
statusFilter.addEventListener("change", applyFilters);
document.getElementById("ticketForm").addEventListener("submit", createTicket);
detailContent.addEventListener("submit", (event) => {
    if (event.target && event.target.id === "ticketUpdateForm") {
        updateTicket(event);
    }
});
window.addEventListener("hashchange", route);

loadTickets().then(route);
