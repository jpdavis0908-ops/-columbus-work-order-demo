
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
 document.getElementById("workOrderTable").innerHTML=filtered.map(o=>`<tr data-id="${esc(o.id)}"><td><b>${esc(o.id)}</b><br><small>${esc(o.cityWo||"")}</small></td><td>${esc(o.department)}</td><td>${esc(o.facility)}</td><td>${esc(o.category)}</td><td><span class="priority ${o.priority.toLowerCase()}">${esc(o.priority)}</span></td><td><span class="status ${o.status==="Completed"?"completed":""}">${esc(o.status)}</span></td><td>${esc(o.technician||"Unassigned")}</td><td>${esc(o.updated)}</td></tr>`).join("");
 const open=orders.filter(o=>o.status!=="Completed").length, urgent=orders.filter(o=>["Priority","Emergency"].includes(o.priority)).length, completed=orders.filter(o=>o.status==="Completed").length;
 ["metricOpen","heroOpen"].forEach(id=>document.getElementById(id).textContent=open);document.getElementById("metricUrgent").textContent=urgent;["metricCompleted","heroCompleted"].forEach(id=>document.getElementById(id).textContent=completed);
 document.querySelectorAll("#workOrderTable tr").forEach(r=>r.onclick=()=>showDetail(r.dataset.id));
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
loginBtn.onclick=()=>loginModal.classList.remove("hidden");closeLogin.onclick=enterDemo.onclick=()=>loginModal.classList.add("hidden");loginModal.onclick=e=>{if(e.target.id==="loginModal")loginModal.classList.add("hidden")};
(function(){let seed=17,g=qrGrid;function rnd(){seed=(seed*9301+49297)%233280;return seed/233280}for(let r=0;r<21;r++)for(let c=0;c<21;c++){let cell=document.createElement("div"),dark=rnd()>.52,f=(r<7&&c<7)||(r<7&&c>13)||(r>13&&c<7);if(f){let rr=r<7?r:r-14,cc=c<7?c:c-14;dark=rr===0||rr===6||cc===0||cc===6||(rr>=2&&rr<=4&&cc>=2&&cc<=4)}cell.className="qr-cell"+(dark?" dark":"");g.appendChild(cell)}})();render();
refreshLiveOrdersIfAvailable();
