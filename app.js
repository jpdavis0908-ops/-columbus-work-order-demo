
async function openWorkOrderFromEmailLink() {
  const params = new URLSearchParams(window.location.search);
  const workOrderNumber = params.get("workOrder");
  const token = params.get("token");

  if (!workOrderNumber || !token || !window.SamsPortalAPI) return;

  try {
    const result = await window.SamsPortalAPI.getWorkOrderByToken(workOrderNumber, token);
    const o = result.work_order;
    if (!o) return;

    document.getElementById("modalTitle").textContent = o.work_order_number;

    const timeline = (o.work_order_events || []).map(evt => `
      <div class="timeline-step">
        <span class="dot"></span>
        <div>
          <strong>${esc(evt.to_status || evt.event_type || "Update")}</strong>
          ${evt.message ? `<div style="margin-top:3px;color:#667085">${esc(evt.message)}</div>` : ""}
          ${evt.created_at ? `<small style="color:#667085">${new Date(evt.created_at).toLocaleString()}</small>` : ""}
        </div>
      </div>
    `).join("");

    document.getElementById("modalBody").innerHTML = `
      <div class="detail-grid">
        <div class="detail-card"><small>City WO / PO</small><strong>${esc(o.city_work_order_number || o.city_po_number || "—")}</strong></div>
        <div class="detail-card"><small>Status</small><strong>${esc(o.status)}</strong></div>
        <div class="detail-card"><small>Department</small><strong>${esc(o.department)}</strong></div>
        <div class="detail-card"><small>Facility</small><strong>${esc(o.facility_name)}</strong></div>
        <div class="detail-card"><small>Priority</small><strong>${esc(o.priority)}</strong></div>
        <div class="detail-card"><small>Assigned Crew</small><strong>${esc(o.assigned_crew || "Unassigned")}</strong></div>
        <div class="detail-card"><small>Assigned Technician</small><strong>${esc(o.assigned_technician || "Unassigned")}</strong></div>
        <div class="detail-card"><small>Submitted</small><strong>${o.submitted_at ? new Date(o.submitted_at).toLocaleString() : "—"}</strong></div>
      </div>

      <div class="detail-card" style="margin-top:12px"><small>Category</small><strong>${esc(o.category)}</strong></div>
      <div class="detail-card" style="margin-top:12px"><small>Description</small><div>${esc(o.description)}</div></div>
      <div class="detail-card" style="margin-top:12px"><small>Access Instructions</small><div>${esc(o.access_instructions || "—")}</div></div>

      <div class="detail-grid">
        <div class="detail-card"><small>Power Out?</small><strong>${esc(o.power_out || "No")}</strong></div>
        <div class="detail-card"><small>Life-Safety Concern?</small><strong>${o.life_safety ? "Yes" : "No"}</strong></div>
      </div>

      <div class="timeline">
        <h3>Service Timeline</h3>
        ${timeline || `<div class="timeline-step"><span class="dot"></span><div><strong>Submitted</strong></div></div>`}
      </div>
    `;

    document.getElementById("modal").classList.remove("hidden");

    // Scroll the page to the work-order dashboard behind the modal for context.
    const orders = document.getElementById("orders") || document.getElementById("dashboard-section");
    if (orders) orders.scrollIntoView({ behavior: "smooth", block: "start" });

  } catch (err) {
    console.error("Unable to open emailed work order:", err);
    alert("This work-order link is invalid or could not be loaded.");
  }
}


async function refreshLiveOrdersIfAvailable() {
  try {
    if (!window.SamsPortalAPI) return;
    const { data: { user } } = await window.SamsPortalAPI.supabase.auth.getUser();
    if (!user) return;

    const live = await window.SamsPortalAPI.getWorkOrders();
    if (!Array.isArray(live)) return;

    localStorage.setItem(key, JSON.stringify(live.map(o => ({
      id: o.work_order_number,
      dbId: o.id,
      cityWo: o.city_work_order_number || "",
      department: o.department,
      facility: o.facility_name,
      address: o.address || "",
      requester: o.requester_name,
      priority: o.priority,
      category: o.category,
      description: o.description,
      accessNotes: o.access_instructions || "",
      powerOut: o.power_out || "No",
      lifeSafety: o.life_safety ? "Yes" : "No",
      technician: o.assigned_technician || o.assigned_crew || "Unassigned",
      status: o.status,
      updated: new Date(o.updated_at || o.submitted_at).toLocaleDateString("en-US", {month:"short",day:"numeric",year:"numeric"}),
      photos: [],
      history: [o.status]
    }))));
    render();
  } catch (err) {
    console.warn("Live dashboard refresh skipped:", err);
  }
}


const seedWorkOrders=[
{id:"SAMS-COC-0008",cityWo:"CCG-DEMO-1088",department:"Facilities Maintenance",facility:"Government Center",address:"Columbus, GA",requester:"Demo User",priority:"Routine",category:"Lighting",description:"Replace several failed LED fixtures in administrative corridor.",accessNotes:"Coordinate with facilities office.",powerOut:"No",lifeSafety:"No",technician:"Crew 3",status:"Completed",updated:"Sep 5, 2026",photos:["hallway-light.jpg"],history:["Submitted","Acknowledged","Scheduled","In Progress","Completed"]},
{id:"SAMS-COC-0007",cityWo:"CCG-DEMO-1081",department:"Parks & Recreation",facility:"Psalmond Road Supercenter",address:"Columbus, GA",requester:"Demo User",priority:"Priority",category:"Breaker / Panel",description:"Breaker trips intermittently serving equipment receptacles.",accessNotes:"Meet site supervisor at front entrance.",powerOut:"Partial",lifeSafety:"No",technician:"Crew 2",status:"Technician En Route",updated:"Sep 6, 2026",photos:[],history:["Submitted","Acknowledged","Technician En Route"]},
{id:"SAMS-COC-0006",cityWo:"CCG-DEMO-1072",department:"Public Works",facility:"Public Works Maintenance Facility",address:"Columbus, GA",requester:"Demo User",priority:"Routine",category:"Exterior / Site Lighting",description:"Two parking-lot pole lights are out.",accessNotes:"Outdoor access available.",powerOut:"No",lifeSafety:"No",technician:"Crew 1",status:"Scheduled",updated:"Sep 6, 2026",photos:["pole-light.jpg"],history:["Submitted","Acknowledged","Scheduled"]},
{id:"SAMS-COC-0005",cityWo:"CCG-DEMO-1065",department:"Fire & EMS",facility:"Fire Station Demo",address:"Columbus, GA",requester:"Demo User",priority:"Emergency",category:"Troubleshooting",description:"Partial power loss in apparatus-bay support area.",accessNotes:"Report to duty officer.",powerOut:"Partial",lifeSafety:"Yes",technician:"Crew 1",status:"In Progress",updated:"Sep 6, 2026",photos:[],history:["Submitted","Acknowledged","Technician En Route","In Progress"]},
{id:"SAMS-COC-0004",cityWo:"CCG-DEMO-1051",department:"Police Department",facility:"Administrative Facility",address:"Columbus, GA",requester:"Demo User",priority:"Routine",category:"Receptacle / Power",description:"Replace damaged receptacles in office area.",accessNotes:"Escort may be required.",powerOut:"No",lifeSafety:"No",technician:"Crew 3",status:"Completed",updated:"Sep 4, 2026",photos:[],history:["Submitted","Acknowledged","Scheduled","In Progress","Completed"]}
];
const key="samsColumbusDemoWorkOrders";
const esc=v=>String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
function getOrders(){const s=localStorage.getItem(key);return s?JSON.parse(s):[...seedWorkOrders]}
function saveOrders(o){localStorage.setItem(key,JSON.stringify(o))}
function render(){
 const orders=getOrders(),q=document.getElementById("searchInput").value.toLowerCase(),sf=document.getElementById("statusFilter").value;
 const filtered=orders.filter(o=>[o.id,o.cityWo,o.department,o.facility,o.category,o.description,o.priority,o.status,o.technician].join(" ").toLowerCase().includes(q)&&(sf==="all"||o.status===sf));
 document.getElementById("workOrderTable").innerHTML=filtered.map(o=>`<tr data-id="${esc(o.id)}"><td><b>${esc(o.id)}</b><br><small>${esc(o.cityWo||"")}</small></td><td>${esc(o.department)}</td><td>${esc(o.facility)}</td><td>${esc(o.category)}</td><td><span class="priority ${o.priority.toLowerCase()}">${esc(o.priority)}</span></td><td><span class="status ${o.status==="Completed"?"completed":""}">${esc(o.status)}</span></td><td>${esc(o.technician||"Unassigned")}</td><td>${esc(o.updated)}</td><td><button class="btn dark dispatch-btn" data-dispatch-order="${esc(o.id)}">Dispatch</button><button class="btn quiet field-btn" data-field-order="${esc(o.id)}">Field</button></td></tr>`).join("");
 const open=orders.filter(o=>o.status!=="Completed").length, urgent=orders.filter(o=>["Priority","Emergency"].includes(o.priority)).length, completed=orders.filter(o=>o.status==="Completed").length;
 ["metricOpen","heroOpen"].forEach(id=>document.getElementById(id).textContent=open);document.getElementById("metricUrgent").textContent=urgent;["metricCompleted","heroCompleted"].forEach(id=>document.getElementById(id).textContent=completed);
 document.querySelectorAll("#workOrderTable tr").forEach(r=>r.onclick=(e)=>{if(e.target.closest("[data-dispatch-order]")||e.target.closest("[data-field-order]"))return;showDetail(r.dataset.id)});
}
function showDetail(id){const o=getOrders().find(x=>x.id===id);if(!o)return;document.getElementById("modalTitle").textContent=o.id;document.getElementById("modalBody").innerHTML=`<div class="detail-grid"><div class="detail-card"><small>City WO / PO</small><b>${esc(o.cityWo||"—")}</b></div><div class="detail-card"><small>Status</small><b>${esc(o.status)}</b></div><div class="detail-card"><small>Department</small><b>${esc(o.department)}</b></div><div class="detail-card"><small>Facility</small><b>${esc(o.facility)}</b></div><div class="detail-card"><small>Priority</small><b>${esc(o.priority)}</b></div><div class="detail-card"><small>Assigned Technician</small><b>${esc(o.technician||"Unassigned")}</b></div><div class="detail-card"><small>Requested By</small><b>${esc(o.requester)}</b></div><div class="detail-card"><small>Updated</small><b>${esc(o.updated)}</b></div></div><div class="detail-card" style="margin-top:12px"><small>Issue</small><b>${esc(o.category)}</b></div><div class="detail-card" style="margin-top:12px"><small>Description</small>${esc(o.description)}</div><div class="detail-card" style="margin-top:12px"><small>Access Notes</small>${esc(o.accessNotes||"—")}</div><div class="timeline"><h3>Service Timeline</h3>${o.history.map(s=>`<div class="timeline-step"><span class="dot"></span><b>${esc(s)}</b></div>`).join("")}</div>`;document.getElementById("modal").classList.remove("hidden")}

document.getElementById("workOrderForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const submitButton = e.submitter;
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.dataset.originalText = submitButton.textContent;
    submitButton.textContent = "Submitting...";
  }

  try {
    const params = new URLSearchParams(window.location.search);

    const payload = {
      facility_code: params.get("facility") || "",
      department: document.getElementById("department").value,
      facility_name: document.getElementById("facility").value,
      address: document.getElementById("address").value,
      city_work_order_number: document.getElementById("cityWo").value,
      requester_name: document.getElementById("requester").value,
      requester_phone: document.getElementById("phone").value,
      requester_email: document.getElementById("email").value,
      preferred_access_time: document.getElementById("accessTime").value,
      priority: document.getElementById("priority").value,
      category: document.getElementById("category").value,
      description: document.getElementById("description").value,
      access_instructions: document.getElementById("accessNotes").value,
      power_out: document.getElementById("powerOut").value,
      life_safety: document.getElementById("lifeSafety").value === "Yes",
      website: ""
    };

    const result = await window.SamsPortalAPI.submitWorkOrder(payload);

    const box = document.getElementById("successBox");
    box.innerHTML = `
      <strong>Work Order Received</strong><br><br>
      Sams Electric work order <strong>${result.work_order_number}</strong> has been created.<br>
      Status: <strong>${result.status}</strong><br>
      Facility: <strong>${payload.facility_name}</strong><br><br>
      Sams Electric has received your request.
    `;
    box.classList.remove("hidden");
    box.scrollIntoView({ behavior: "smooth", block: "center" });

    // Immediately show the new submission in this browser's dashboard.
    // This does not expose other database work orders to anonymous visitors.
    const current = getOrders();
    current.unshift({
      id: result.work_order_number,
      dbId: result.work_order_id || "",
      cityWo: payload.city_work_order_number || "",
      department: payload.department,
      facility: payload.facility_name,
      address: payload.address || "",
      requester: payload.requester_name,
      priority: payload.priority,
      category: payload.category,
      description: payload.description,
      accessNotes: payload.access_instructions || "",
      powerOut: payload.power_out || "No",
      lifeSafety: payload.life_safety ? "Yes" : "No",
      technician: "Awaiting Dispatch",
      status: result.status || "Submitted",
      updated: new Date().toLocaleDateString("en-US", {month:"short",day:"numeric",year:"numeric"}),
      photos: [],
      history: ["Submitted"]
    });
    saveOrders(current);
    render();

    e.target.reset();
    await refreshLiveOrdersIfAvailable();
  } catch (err) {
    console.error(err);
    alert("Unable to submit the work order. The Supabase submit-work-order function may not be deployed yet.");
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = submitButton.dataset.originalText || "Submit Work Order";
    }
  }
});
searchInput.oninput=render;statusFilter.onchange=render;resetDemo.onclick=()=>{localStorage.removeItem(key);render();alert("Demo data has been reset.")};
closeModal.onclick=closeModalBottom.onclick=()=>modal.classList.add("hidden");modal.onclick=e=>{if(e.target.id==="modal")modal.classList.add("hidden")};printWorkOrder.onclick=()=>window.print();
document.querySelectorAll("[data-scroll]").forEach(b=>b.onclick=()=>{document.querySelectorAll(".nav").forEach(n=>n.classList.remove("active"));if(b.classList.contains("nav"))b.classList.add("active");document.getElementById(b.dataset.scroll).scrollIntoView({behavior:"smooth"})});

const loginBtn = document.getElementById("loginBtn");
const loginModal = document.getElementById("loginModal");
const closeLogin = document.getElementById("closeLogin");
const staffSignIn = document.getElementById("staffSignIn");
const staffSignOut = document.getElementById("staffSignOut");
const refreshLiveDashboard = document.getElementById("refreshLiveDashboard");
const refreshDashboard = document.getElementById("refreshDashboard");

function setLoginMessage(message, kind="") {
  const el = document.getElementById("loginMessage");
  el.textContent = message || "";
  el.className = "auth-message" + (kind ? " " + kind : "") + (!message ? " hidden" : "");
}

async function updateAuthUI() {
  try {
    const session = await window.SamsPortalAPI.getSession();
    const loginFields = document.getElementById("loginFields");
    const signedInPanel = document.getElementById("signedInPanel");
    const dashboardMode = document.getElementById("dashboardMode");

    if (!session) {
      loginFields.classList.remove("hidden");
      signedInPanel.classList.add("hidden");
      document.getElementById("userName").textContent = "Sams Electric Staff";
      document.getElementById("userRole").textContent = "Sign in for live dispatch dashboard";
      document.getElementById("userAvatar").textContent = "SE";
      dashboardMode.textContent = "Demo / Local";
      return false;
    }

    const profile = await window.SamsPortalAPI.getProfile();
    if (!profile || !profile.active || !["sams_admin","sams_dispatch"].includes(profile.role)) {
      await window.SamsPortalAPI.signOut();
      throw new Error("This account is not authorized for the Sams Electric staff dashboard.");
    }

    loginFields.classList.add("hidden");
    signedInPanel.classList.remove("hidden");

    const name = profile.full_name || profile.email || "Sams Electric Staff";
    const initials = name.split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join("").toUpperCase() || "SE";
    const roleLabel = profile.role === "sams_admin" ? "Sams Admin" : "Sams Dispatch";

    document.getElementById("userName").textContent = name;
    document.getElementById("userRole").textContent = roleLabel + " · Live database";
    document.getElementById("userAvatar").textContent = initials;
    document.getElementById("signedInName").textContent = name;
    document.getElementById("signedInEmail").textContent = profile.email || "";
    document.getElementById("signedInRole").textContent = roleLabel;
    dashboardMode.textContent = "LIVE";
    return true;
  } catch (err) {
    console.error("Auth UI:", err);
    setLoginMessage(err.message || "Unable to verify staff account.", "error");
    return false;
  }
}

loginBtn.onclick = async () => {
  setLoginMessage("");
  await updateAuthUI();
  loginModal.classList.remove("hidden");
};

closeLogin.onclick = () => loginModal.classList.add("hidden");
loginModal.onclick = e => {
  if (e.target.id === "loginModal") loginModal.classList.add("hidden");
};

staffSignIn.onclick = async () => {
  const email = document.getElementById("staffEmail").value.trim();
  const password = document.getElementById("staffPassword").value;
  if (!email || !password) {
    setLoginMessage("Enter your email and password.", "error");
    return;
  }

  staffSignIn.disabled = true;
  staffSignIn.textContent = "Signing In...";
  setLoginMessage("");

  try {
    const result = await window.SamsPortalAPI.signIn(email, password);
    if (!result || !result.session) {
      throw new Error("Supabase did not return an authenticated session.");
    }

    setLoginMessage("Signed in. Verifying staff access...", "success");

    // The auth-state event is deferred above, so it is now safe to query profile/session.
    const authorized = await updateAuthUI();
    if (!authorized) return;

    setLoginMessage("Signed in. Loading live work orders...", "success");
    await refreshLiveOrdersIfAvailable();
    setTimeout(() => loginModal.classList.add("hidden"), 700);
  } catch (err) {
    console.error("Sign in:", err);
    setLoginMessage(err.message || "Sign in failed.", "error");
  } finally {
    staffSignIn.disabled = false;
    staffSignIn.textContent = "Sign In";
  }
};

staffSignOut.onclick = async () => {
  try {
    await window.SamsPortalAPI.signOut();
    document.getElementById("loginFields").classList.remove("hidden");
    document.getElementById("signedInPanel").classList.add("hidden");
    document.getElementById("dashboardMode").textContent = "Demo / Local";
    document.getElementById("userName").textContent = "Sams Electric Staff";
    document.getElementById("userRole").textContent = "Sign in for live dispatch dashboard";
    document.getElementById("userAvatar").textContent = "SE";
    setLoginMessage("Signed out.", "success");
    render();
  } catch (err) {
    setLoginMessage(err.message || "Unable to sign out.", "error");
  }
};

refreshLiveDashboard.onclick = async () => {
  await refreshLiveOrdersIfAvailable();
  setLoginMessage("Live dashboard refreshed.", "success");
};

refreshDashboard.onclick = async () => {
  const live = await updateAuthUI();
  if (live) await refreshLiveOrdersIfAvailable();
  else render();
};

window.SamsPortalAPI.supabase.auth.onAuthStateChange(() => {
  // Do not call Supabase auth APIs from inside the auth callback itself.
  // Defer the UI/profile refresh until the auth event has fully completed.
  setTimeout(() => {
    updateAuthUI().then(() => refreshLiveOrdersIfAvailable());
  }, 0);
});

(function(){let seed=17,g=qrGrid;function rnd(){seed=(seed*9301+49297)%233280;return seed/233280}for(let r=0;r<21;r++)for(let c=0;c<21;c++){let cell=document.createElement("div"),dark=rnd()>.52,f=(r<7&&c<7)||(r<7&&c>13)||(r>13&&c<7);if(f){let rr=r<7?r:r-14,cc=c<7?c:c-14;dark=rr===0||rr===6||cc===0||cc===6||(rr>=2&&rr<=4&&cc>=2&&cc<=4)}cell.className="qr-cell"+(dark?" dark":"");g.appendChild(cell)}})();render();
updateAuthUI().then(()=>refreshLiveOrdersIfAvailable());

openWorkOrderFromEmailLink();


let activeDispatchWorkOrder = null;

function dispatchEsc(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[c]));
}

function toLocalInputValue(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = n => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function setDispatchMessage(message, kind="") {
  const el = document.getElementById("dispatchMessage");
  if (!el) return;
  el.textContent = message || "";
  el.className = "auth-message" + (kind ? " " + kind : "") + (!message ? " hidden" : "");
}

function renderDispatchHistory(order) {
  const el = document.getElementById("dispatchHistory");
  if (!el) return;

  const events = [...(order.work_order_events || [])]
    .sort((a,b) => new Date(b.created_at) - new Date(a.created_at));

  if (!events.length) {
    el.innerHTML = '<div class="muted-copy">No dispatch history yet.</div>';
    return;
  }

  el.innerHTML = events.map(evt => `
    <div class="dispatch-history-item">
      <strong>${dispatchEsc(evt.to_status || evt.event_type || "Update")}</strong>
      ${evt.visible_to_city === false
        ? '<span class="dispatch-private">Internal</span>'
        : '<span class="dispatch-public">City-visible</span>'}
      ${evt.message ? `<div>${dispatchEsc(evt.message)}</div>` : ""}
      <small>${evt.actor_name ? dispatchEsc(evt.actor_name) + " · " : ""}${evt.created_at ? new Date(evt.created_at).toLocaleString() : ""}</small>
    </div>
  `).join("");
}

async function openDispatchControls(orderNumber) {
  try {
    const session = await window.SamsPortalAPI.getSession();
    if (!session) {
      alert("Sign in as Sams Electric staff to dispatch this work order.");
      return;
    }

    const result = await window.SamsPortalAPI.getWorkOrderByNumber(orderNumber);
    const order = result?.work_order || result;
    if (!order) throw new Error("Work order could not be loaded.");

    activeDispatchWorkOrder = order;

    document.getElementById("dispatchTitle").textContent = `Dispatch ${order.work_order_number}`;
    document.getElementById("dispatchSummary").innerHTML = `
      <strong>${dispatchEsc(order.facility_name || "Facility")}</strong>
      <div>${dispatchEsc(order.priority || "Routine")} · ${dispatchEsc(order.category || "Electrical")}</div>
      <div style="margin-top:4px">${dispatchEsc(order.description || "")}</div>
    `;

    document.getElementById("dispatchStatus").value = order.status || "Submitted";
    document.getElementById("dispatchScheduledFor").value = toLocalInputValue(order.scheduled_for);
    document.getElementById("dispatchCrew").value = order.assigned_crew || "";
    document.getElementById("dispatchTechnician").value = order.assigned_technician || "";
    document.getElementById("dispatchInternalNote").value = "";
    document.getElementById("dispatchCityNote").value = "";
    document.getElementById("dispatchCompletionSummary").value = order.completion_summary || "";

    renderDispatchHistory(order);
    setDispatchMessage("");
    document.getElementById("dispatchModal").style.display = ""; document.getElementById("dispatchModal").classList.remove("hidden");
  } catch (err) {
    console.error("Dispatch load:", err);
    alert(err.message || "Unable to load dispatch controls.");
  }
}

async function saveDispatchUpdate() {
  if (!activeDispatchWorkOrder) return;

  const btn = document.getElementById("saveDispatch");
  btn.disabled = true;
  btn.textContent = "Saving...";
  setDispatchMessage("");

  try {
    const scheduledLocal = document.getElementById("dispatchScheduledFor").value;
    const payload = {
      work_order_number: activeDispatchWorkOrder.work_order_number,
      status: document.getElementById("dispatchStatus").value,
      scheduled_for: scheduledLocal ? new Date(scheduledLocal).toISOString() : null,
      assigned_crew: document.getElementById("dispatchCrew").value,
      assigned_technician: document.getElementById("dispatchTechnician").value.trim(),
      internal_note: document.getElementById("dispatchInternalNote").value.trim(),
      city_note: document.getElementById("dispatchCityNote").value.trim(),
      completion_summary: document.getElementById("dispatchCompletionSummary").value.trim(),
    };

    const result = await window.SamsPortalAPI.updateWorkOrder(payload);
    activeDispatchWorkOrder = result.work_order;

    renderDispatchHistory(activeDispatchWorkOrder);
    document.getElementById("dispatchInternalNote").value = "";
    document.getElementById("dispatchCityNote").value = "";

    setDispatchMessage("Dispatch update saved.", "success");
    await refreshLiveOrdersIfAvailable();
  } catch (err) {
    console.error("Dispatch save:", err);
    setDispatchMessage(err.message || "Unable to save dispatch update.", "error");
  } finally {
    btn.disabled = false;
    btn.textContent = "Save Dispatch Update";
  }
}


const dispatchModal = document.getElementById("dispatchModal");
function closeDispatchModal() {
  const modal = document.getElementById("dispatchModal");
  if (!modal) return;
  modal.classList.add("hidden");
  activeDispatchWorkOrder = null;
  setDispatchMessage("");
}

document.addEventListener("click", (e) => {
  if (e.target.closest("#closeDispatch") || e.target.closest("#cancelDispatch")) {
    e.preventDefault();
    e.stopPropagation();
    closeDispatchModal();
    return;
  }

  const modal = document.getElementById("dispatchModal");
  if (modal && e.target === modal) {
    closeDispatchModal();
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    const modal = document.getElementById("dispatchModal");
    if (modal && !modal.classList.contains("hidden")) closeDispatchModal();
  }
});


document.addEventListener("click", async e => {
  const btn = e.target.closest("[data-dispatch-order]");
  if (!btn) return;
  e.preventDefault();
  await openDispatchControls(btn.dataset.dispatchOrder);
});



let activeFieldWorkOrder = null;
let pendingFieldStatus = null;

function setFieldMessage(message, kind="") {
  const el = document.getElementById("fieldMessage");
  if (!el) return;
  el.textContent = message || "";
  el.className = "auth-message" + (kind ? " " + kind : "") + (!message ? " hidden" : "");
}

function renderFieldHistory(order) {
  const el = document.getElementById("fieldHistory");
  if (!el) return;
  const events = [...(order.work_order_events || [])]
    .sort((a,b) => new Date(b.created_at) - new Date(a.created_at));

  if (!events.length) {
    el.innerHTML = '<div class="muted-copy">No job history yet.</div>';
    return;
  }

  el.innerHTML = events.map(evt => `
    <div class="field-history-item">
      <strong>${dispatchEsc(evt.to_status || evt.event_type || "Update")}</strong>
      ${evt.message ? `<div>${dispatchEsc(evt.message)}</div>` : ""}
      <small>${evt.actor_name ? dispatchEsc(evt.actor_name) + " · " : ""}${evt.created_at ? new Date(evt.created_at).toLocaleString() : ""}</small>
    </div>
  `).join("");
}


function updateFieldStatusHighlight(status) {
  document.querySelectorAll("[data-field-status]").forEach(btn => {
    btn.classList.remove("field-status-active");
    if (btn.dataset.fieldStatus === status) {
      btn.classList.add("field-status-active");
    }
  });
}

async function openFieldWorkflow(orderNumber) {
  try {
    const session = await window.SamsPortalAPI.getSession();
    if (!session) {
      alert("Sign in as Sams Electric staff to use the technician workflow.");
      return;
    }

    const order = await window.SamsPortalAPI.getWorkOrderByNumber(orderNumber);
    if (!order) throw new Error("Work order could not be loaded.");

    activeFieldWorkOrder = order;
    pendingFieldStatus = order.status || "Submitted";

    document.getElementById("fieldTitle").textContent = order.work_order_number;
    document.getElementById("fieldSummary").innerHTML = `
      <strong>${dispatchEsc(order.facility_name || "Facility")}</strong>
      <div>${dispatchEsc(order.priority || "Routine")} · ${dispatchEsc(order.category || "Electrical")}</div>
      <div class="field-address">${dispatchEsc(order.address || "")}</div>
      <div style="margin-top:8px">${dispatchEsc(order.description || "")}</div>
      ${order.access_instructions ? `<div style="margin-top:8px"><strong>Access:</strong> ${dispatchEsc(order.access_instructions)}</div>` : ""}
      ${order.assigned_crew || order.assigned_technician ? `<div style="margin-top:8px"><strong>Assigned:</strong> ${dispatchEsc(order.assigned_crew || "")}${order.assigned_crew && order.assigned_technician ? " · " : ""}${dispatchEsc(order.assigned_technician || "")}</div>` : ""}
    `;

    const maps = document.getElementById("fieldMapsLink");
    maps.href = order.address
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.address)}`
      : "#";
    maps.style.opacity = order.address ? "1" : ".5";

    const phone = document.getElementById("fieldPhoneLink");
    phone.href = order.requester_phone ? `tel:${order.requester_phone.replace(/[^\d+]/g,"")}` : "#";
    phone.textContent = order.requester_phone ? `Call ${order.requester_name || "Requestor"}` : "No Requestor Phone";
    phone.style.opacity = order.requester_phone ? "1" : ".5";

    document.getElementById("fieldCurrentStatus").textContent = pendingFieldStatus;
    updateFieldStatusHighlight(pendingFieldStatus);
    document.getElementById("fieldLaborHours").value = Number(order.labor_hours || 0).toFixed(2);
    document.getElementById("fieldMaterials").value = order.materials_used || "";
    document.getElementById("fieldNotes").value = order.field_notes || "";
    document.getElementById("fieldCityUpdate").value = "";
    document.getElementById("fieldCompletion").value = order.completion_summary || "";

    renderFieldHistory(order);
    setFieldMessage("");

    const modal = document.getElementById("fieldModal");
    modal.style.display = "";
    modal.classList.remove("hidden");
    setPhotoMessage("");
    await loadFieldPhotos();
  } catch (err) {
    console.error("Field workflow load:", err);
    alert(err.message || "Unable to load technician workflow.");
  }
}

async function saveFieldWorkflow() {
  if (!activeFieldWorkOrder) return;

  const completion = document.getElementById("fieldCompletion").value.trim();
  if (pendingFieldStatus === "Completed" && !completion) {
    setFieldMessage("Enter a completion summary before marking the work order Completed.", "error");
    return;
  }

  const btn = document.getElementById("saveFieldUpdate");
  btn.disabled = true;
  btn.textContent = "Saving...";
  setFieldMessage("");

  try {
    const fieldNotes = document.getElementById("fieldNotes").value.trim();
    const materials = document.getElementById("fieldMaterials").value.trim();
    const hours = Number(document.getElementById("fieldLaborHours").value || 0);
    const cityUpdate = document.getElementById("fieldCityUpdate").value.trim();

    const noteParts = [];
    if (hours > 0) noteParts.push(`Labor hours: ${hours}`);
    if (materials) noteParts.push(`Materials: ${materials}`);
    if (fieldNotes) noteParts.push(`Field notes: ${fieldNotes}`);

    const payload = {
      work_order_number: activeFieldWorkOrder.work_order_number,
      status: pendingFieldStatus,
      labor_hours: hours,
      materials_used: materials,
      field_notes: fieldNotes,
      completion_summary: completion,
      technician_note: noteParts.join(" | "),
      city_note: cityUpdate
    };

    const result = await window.SamsPortalAPI.updateWorkOrder(payload);
    activeFieldWorkOrder = result.work_order;

    document.getElementById("fieldCurrentStatus").textContent = activeFieldWorkOrder.status;
    pendingFieldStatus = activeFieldWorkOrder.status;
    updateFieldStatusHighlight(activeFieldWorkOrder.status);
    document.getElementById("fieldCityUpdate").value = "";
    renderFieldHistory(activeFieldWorkOrder);
    setFieldMessage("Field update saved.", "success");
    await refreshLiveOrdersIfAvailable();
  } catch (err) {
    console.error("Field workflow save:", err);
    setFieldMessage(err.message || "Unable to save field update.", "error");
  } finally {
    btn.disabled = false;
    btn.textContent = "Save Field Update";
  }
}

document.addEventListener("click", async (e) => {
  const fieldBtn = e.target.closest("[data-field-order]");
  if (fieldBtn) {
    e.preventDefault();
    e.stopPropagation();
    await openFieldWorkflow(fieldBtn.dataset.fieldOrder);
    return;
  }

  const statusBtn = e.target.closest("[data-field-status]");
  if (statusBtn) {
    e.preventDefault();
    pendingFieldStatus = statusBtn.dataset.fieldStatus;
    document.getElementById("fieldCurrentStatus").textContent = pendingFieldStatus;
    updateFieldStatusHighlight(pendingFieldStatus);
    setFieldMessage(`Status will change to ${pendingFieldStatus} when you save.`, "success");
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    const modal = document.getElementById("fieldModal");
    if (modal && !modal.classList.contains("hidden")) {
      modal.classList.add("hidden");
      modal.style.display = "none";
      activeFieldWorkOrder = null;
      pendingFieldStatus = null;
    }
  }
});



// Save buttons are rendered after app.js loads, so bind through document delegation.
document.addEventListener("click", async (e) => {
  const dispatchSave = e.target.closest && e.target.closest("#saveDispatch");
  if (dispatchSave) {
    e.preventDefault();
    e.stopPropagation();
    await saveDispatchUpdate();
    return;
  }

  const fieldSave = e.target.closest && e.target.closest("#saveFieldUpdate");
  if (fieldSave) {
    e.preventDefault();
    e.stopPropagation();
    await saveFieldWorkflow();
  }
});



function setPhotoMessage(message, kind="") {
  const el = document.getElementById("photoUploadMessage");
  if (!el) return;
  el.textContent = message || "";
  el.className = "auth-message" + (kind ? " " + kind : "") + (!message ? " hidden" : "");
}

async function loadFieldPhotos() {
  const gallery = document.getElementById("fieldPhotoGallery");
  if (!gallery || !activeFieldWorkOrder) return;

  gallery.innerHTML = '<div class="muted-copy">Loading photos...</div>';

  try {
    const result = await window.SamsPortalAPI.listWorkOrderPhotos(activeFieldWorkOrder.work_order_number);
    const photos = result.photos || [];

    if (!photos.length) {
      gallery.innerHTML = '<div class="muted-copy">No photos uploaded yet.</div>';
      return;
    }

    gallery.innerHTML = photos.map(photo => `
      <a class="photo-card" href="${photo.signed_url || "#"}" target="_blank" rel="noopener">
        ${photo.signed_url ? `<img src="${photo.signed_url}" alt="${dispatchEsc(photo.file_name || "Work order photo")}">` : ""}
        <div class="photo-card-body">
          <span class="photo-type-badge">${dispatchEsc(photo.photo_type || "Other")}</span>
          <strong>${dispatchEsc(photo.file_name || "Photo")}</strong>
          <small>${photo.uploaded_by_name ? dispatchEsc(photo.uploaded_by_name) + " · " : ""}${photo.uploaded_at ? new Date(photo.uploaded_at).toLocaleString() : ""}</small>
        </div>
      </a>
    `).join("");
  } catch (err) {
    console.error("Load photos:", err);
    gallery.innerHTML = '<div class="muted-copy">Unable to load photos.</div>';
  }
}

async function handleFieldPhotoUpload(file) {
  if (!file || !activeFieldWorkOrder) return;

  const allowed = ["image/jpeg","image/png","image/webp"];
  if (!allowed.includes(file.type)) {
    setPhotoMessage("Please select a JPG, PNG, or WebP image.", "error");
    return;
  }

  if (file.size > 15 * 1024 * 1024) {
    setPhotoMessage("Photo must be 15 MB or smaller.", "error");
    return;
  }

  const type = document.getElementById("fieldPhotoType").value || "Other";
  setPhotoMessage(`Preparing ${type.toLowerCase()} photo...`, "success");

  try {
    const prepared = await window.SamsPortalAPI.createPhotoUpload({
      work_order_number: activeFieldWorkOrder.work_order_number,
      file_name: file.name || "photo.jpg",
      mime_type: file.type,
      file_size: file.size,
      photo_type: type
    });

    setPhotoMessage("Uploading photo...", "success");

    await window.SamsPortalAPI.uploadPhotoToSignedUrl(
      prepared.path,
      prepared.token,
      file
    );

    setPhotoMessage(`${type} photo uploaded successfully.`, "success");
    document.getElementById("fieldPhotoInput").value = "";
    await loadFieldPhotos();
    await refreshLiveOrdersIfAvailable();
  } catch (err) {
    console.error("Photo upload:", err);
    setPhotoMessage(err.message || "Photo upload failed.", "error");
  }
}

document.addEventListener("change", async (e) => {
  if (e.target && e.target.id === "fieldPhotoInput") {
    const file = e.target.files && e.target.files[0];
    if (file) await handleFieldPhotoUpload(file);
  }
});



let cityTrackingProfile=null,cityTrackingOrders=[];
function cityEsc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));}
function cityDate(v){if(!v)return"—";const d=new Date(v);return Number.isNaN(d.getTime())?"—":d.toLocaleString();}
function setCityLoginMessage(m,k=""){const e=document.getElementById("cityLoginMessage");if(!e)return;e.textContent=m||"";e.className="auth-message"+(k?" "+k:"")+(!m?" hidden":"");}
function renderCityTracking(){
  const cards=document.getElementById("cityWorkOrderCards"),o=cityTrackingOrders||[];
  if(!cards)return;

  document.getElementById("cityOpenCount").textContent=o.filter(x=>!["Completed","Cancelled"].includes(x.status)).length;
  document.getElementById("cityScheduledCount").textContent=o.filter(x=>x.status==="Scheduled").length;
  document.getElementById("cityProgressCount").textContent=o.filter(x=>["Technician En Route","In Progress","Waiting on City"].includes(x.status)).length;
  document.getElementById("cityCompletedCount").textContent=o.filter(x=>x.status==="Completed").length;

  if(!o.length){
    cards.innerHTML='<div class="city-empty">No City work orders are available for this account.</div>';
    return;
  }

  cards.innerHTML=o.map(x=>`<article class="city-order-card">
    <div class="city-order-card-head">
      <div class="city-order-title">
        <strong>${cityEsc(x.work_order_number)}</strong>
        ${x.city_work_order_number?`<small>City WO: ${cityEsc(x.city_work_order_number)}</small>`:""}
      </div>
      <span class="status ${x.status==="Completed"?"completed":""}">${cityEsc(x.status||"Submitted")}</span>
    </div>

    <div class="city-card-row">
      <span>Facility</span>
      <strong>${cityEsc(x.facility_name||"—")}</strong>
    </div>

    <div class="city-card-row">
      <span>Issue</span>
      <strong>${cityEsc(x.category||"Electrical")}</strong>
    </div>

    <div class="city-card-row">
      <span>Priority</span>
      <strong>${cityEsc(x.priority||"Routine")}</strong>
    </div>

    <div class="city-card-row">
      <span>Scheduled</span>
      <strong>${cityDate(x.scheduled_for)}</strong>
    </div>

    <div class="city-card-row">
      <span>Updated</span>
      <strong>${cityDate(x.updated_at)}</strong>
    </div>

    <button type="button" class="btn primary full-btn city-view-btn" data-city-detail="${cityEsc(x.work_order_number)}">View Work Order</button>
  </article>`).join("");
}
async function loadCityTracking(){const r=await window.SamsPortalAPI.getCityWorkOrders();cityTrackingProfile=r.profile;cityTrackingOrders=r.work_orders||[];document.getElementById("cityTrackingIdentity").textContent=`${cityTrackingProfile.full_name||cityTrackingProfile.email} · ${cityTrackingProfile.role==="city_supervisor"?(cityTrackingProfile.department||"Department")+" Supervisor":"City Requestor"}`;document.getElementById("cityTrackingSection").classList.remove("hidden");renderCityTracking();}
async function citySignIn(){const email=document.getElementById("cityEmail").value.trim(),pw=document.getElementById("cityPassword").value,b=document.getElementById("citySignIn");if(!email||!pw){setCityLoginMessage("Enter your City email and password.","error");return;}b.disabled=true;b.textContent="Signing In...";try{const r=await window.SamsPortalAPI.signIn(email,pw);if(!r?.session)throw new Error("Unable to create a City session.");await loadCityTracking();document.getElementById("cityLoginModal").classList.add("hidden");document.getElementById("cityTrackingSection").scrollIntoView({behavior:"smooth"});}catch(e){await window.SamsPortalAPI.signOut().catch(()=>{});setCityLoginMessage(e.message||"City sign in failed.","error");}finally{b.disabled=false;b.textContent="Sign In";}}
async function openCityDetail(n){try{const r=await window.SamsPortalAPI.getCityWorkOrderDetail(n),o=r.work_order,ev=r.events||[],ph=r.photos||[];document.getElementById("cityDetailTitle").textContent=o.work_order_number;document.getElementById("cityDetailBody").innerHTML=`<div class="city-detail-grid"><div class="city-detail-item"><small>Status</small><strong>${cityEsc(o.status)}</strong></div><div class="city-detail-item"><small>Priority</small><strong>${cityEsc(o.priority)}</strong></div><div class="city-detail-item"><small>Facility</small><strong>${cityEsc(o.facility_name||"—")}</strong></div><div class="city-detail-item"><small>Scheduled</small><strong>${cityDate(o.scheduled_for)}</strong></div><div class="city-detail-item"><small>Assigned Crew</small><strong>${cityEsc(o.assigned_crew||"Not assigned")}</strong></div><div class="city-detail-item"><small>Technician</small><strong>${cityEsc(o.assigned_technician||"Not assigned")}</strong></div></div><div class="city-detail-section"><h4>Service Request</h4><div class="city-detail-item"><small>Issue</small><strong>${cityEsc(o.category||"Electrical")}</strong><div style="margin-top:6px">${cityEsc(o.description||"")}</div></div></div>${o.completion_summary?`<div class="city-detail-section"><h4>Completion Summary</h4><div class="city-detail-item">${cityEsc(o.completion_summary)}</div></div>`:""}<div class="city-detail-section"><h4>Service Timeline</h4>${ev.length?ev.map(e=>`<div class="city-timeline-item"><strong>${cityEsc(e.to_status||e.event_type||"Update")}</strong>${e.message?`<div>${cityEsc(e.message)}</div>`:""}<small>${e.actor_name?cityEsc(e.actor_name)+" · ":""}${cityDate(e.created_at)}</small></div>`).join(""):'<div class="muted-copy">No City-visible updates yet.</div>'}</div><div class="city-detail-section"><h4>Photos</h4>${ph.length?`<div class="city-photo-grid">${ph.map(q=>`<a href="${q.signed_url||"#"}" target="_blank" rel="noopener">${q.signed_url?`<img src="${q.signed_url}" alt="${cityEsc(q.file_name||"Work order photo")}">`:""}<div class="city-photo-meta"><strong>${cityEsc(q.photo_type||"Photo")}</strong><small>${cityDate(q.uploaded_at)}</small></div></a>`).join("")}</div>`:'<div class="muted-copy">No City-visible photos.</div>'}</div>`;const m=document.getElementById("cityDetailModal");m.style.display="";m.classList.remove("hidden");}catch(e){console.error("City detail:",e);alert(e?.message?`Unable to load City work order: ${e.message}`:"Unable to load City work order.");}}
document.addEventListener("click",async e=>{if(e.target.closest("#cityAccessBtn")){e.preventDefault();setCityLoginMessage("");document.getElementById("cityLoginModal").classList.remove("hidden");return;}if(e.target.closest("#citySignIn")){e.preventDefault();await citySignIn();return;}if(e.target.closest("#refreshCityTracking")){e.preventDefault();await loadCityTracking();return;}if(e.target.closest("#citySignOut")){e.preventDefault();await window.SamsPortalAPI.signOut();cityTrackingProfile=null;cityTrackingOrders=[];document.getElementById("cityTrackingSection").classList.add("hidden");return;}const b=e.target.closest("[data-city-detail]");if(b){e.preventDefault();await openCityDetail(b.dataset.cityDetail);}});

