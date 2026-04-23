const state = {
  bootstrap: null,
  session: null,
  otpContext: null,
  dashboard: null,
  map: {
    zoom: 1,
    expanded: true,
    selectedId: null,
    projectPinMode: false,
    projectDraftPoint: null,
    bounds: null,
  },
};

const el = {
  loginRole: document.getElementById("loginRole"),
  loginMobile: document.getElementById("loginMobile"),
  requestOtpForm: document.getElementById("requestOtpForm"),
  verifyOtpForm: document.getElementById("verifyOtpForm"),
  otpCode: document.getElementById("otpCode"),
  otpHint: document.getElementById("otpHint"),
  authBanner: document.getElementById("authBanner"),
  dashboardTitle: document.getElementById("dashboardTitle"),
  dashboardSubtitle: document.getElementById("dashboardSubtitle"),
  dashboardCards: document.getElementById("dashboardCards"),
  registryPanel: document.getElementById("registryPanel"),
  workerTableBody: document.getElementById("workerTableBody"),
  workerFilterCategory: document.getElementById("workerFilterCategory"),
  workerFilterCity: document.getElementById("workerFilterCity"),
  workerFilterSkill: document.getElementById("workerFilterSkill"),
  workerFilterStatus: document.getElementById("workerFilterStatus"),
  professionalRegistryPanel: document.getElementById("professionalRegistryPanel"),
  professionalFilterEducation: document.getElementById("professionalFilterEducation"),
  professionalFilterField: document.getElementById("professionalFilterField"),
  professionalFilterRole: document.getElementById("professionalFilterRole"),
  professionalFilterNotice: document.getElementById("professionalFilterNotice"),
  professionalTableBody: document.getElementById("professionalTableBody"),
  registrationClass: document.getElementById("registrationClass"),
  workerRegistrationSection: document.getElementById("workerRegistrationSection"),
  engineerRegistrationSection: document.getElementById("engineerRegistrationSection"),
  registrationGuideTitle: document.getElementById("registrationGuideTitle"),
  registrationGuideText: document.getElementById("registrationGuideText"),
  registrationChecklist: document.getElementById("registrationChecklist"),
  registrationReadiness: document.getElementById("registrationReadiness"),
  workerForm: document.getElementById("workerForm"),
  workerIndustry: document.getElementById("workerIndustry"),
  workerSkill: document.getElementById("workerSkill"),
  workerVisibility: document.getElementById("workerVisibility"),
  workerShiftPreference: document.getElementById("workerShiftPreference"),
  workerPreferredDayWage: document.getElementById("workerPreferredDayWage"),
  workerPreferredNightWage: document.getElementById("workerPreferredNightWage"),
  workerWageFlexibility: document.getElementById("workerWageFlexibility"),
  projectLocationForm: document.getElementById("projectLocationForm"),
  projectCountry: document.getElementById("projectCountry"),
  projectState: document.getElementById("projectState"),
  projectDistrict: document.getElementById("projectDistrict"),
  projectSiteName: document.getElementById("projectSiteName"),
  projectStreetAddress: document.getElementById("projectStreetAddress"),
  projectLatitude: document.getElementById("projectLatitude"),
  projectLongitude: document.getElementById("projectLongitude"),
  projectUseCurrentLocationButton: document.getElementById("projectUseCurrentLocationButton"),
  projectLocationStatus: document.getElementById("projectLocationStatus"),
  engineerForm: document.getElementById("engineerForm"),
  engineerStatus: document.getElementById("engineerStatus"),
  engineerResumeFile: document.getElementById("engineerResumeFile"),
  engineerEducation: document.getElementById("engineerEducation"),
  engineerField: document.getElementById("engineerField"),
  engineerFieldOtherWrap: document.getElementById("engineerFieldOtherWrap"),
  engineerFieldOther: document.getElementById("engineerFieldOther"),
  engineerCategory: document.getElementById("engineerCategory"),
  engineerCategoryOtherWrap: document.getElementById("engineerCategoryOtherWrap"),
  engineerCategoryOther: document.getElementById("engineerCategoryOther"),
  engineerSpecialization: document.getElementById("engineerSpecialization"),
  engineerSpecializationOtherWrap: document.getElementById("engineerSpecializationOtherWrap"),
  engineerSpecializationOther: document.getElementById("engineerSpecializationOther"),
  aiInsights: document.getElementById("aiInsights"),
  workerPreferencePanel: document.getElementById("workerPreferencePanel"),
  workerPreferenceForm: document.getElementById("workerPreferenceForm"),
  prefVisibility: document.getElementById("prefVisibility"),
  prefShiftPreference: document.getElementById("prefShiftPreference"),
  prefDayWage: document.getElementById("prefDayWage"),
  prefNightWage: document.getElementById("prefNightWage"),
  prefWageFlexibility: document.getElementById("prefWageFlexibility"),
  prefServiceRadiusKm: document.getElementById("prefServiceRadiusKm"),
  prefLiveStatus: document.getElementById("prefLiveStatus"),
  workerPreferenceStatus: document.getElementById("workerPreferenceStatus"),
  clientOfferPanel: document.getElementById("clientOfferPanel"),
  clientOfferForm: document.getElementById("clientOfferForm"),
  offerWorkerId: document.getElementById("offerWorkerId"),
  offerShiftType: document.getElementById("offerShiftType"),
  offerDayWage: document.getElementById("offerDayWage"),
  offerNightWage: document.getElementById("offerNightWage"),
  offerMessage: document.getElementById("offerMessage"),
  clientOfferStatus: document.getElementById("clientOfferStatus"),
  offerFeed: document.getElementById("offerFeed"),
  nearbyMatchFeed: document.getElementById("nearbyMatchFeed"),
  notificationFeed: document.getElementById("notificationFeed"),
  alertPreferenceForm: document.getElementById("alertPreferenceForm"),
  alertNearbyEnabled: document.getElementById("alertNearbyEnabled"),
  alertPreferenceStatus: document.getElementById("alertPreferenceStatus"),
  locationStatus: document.getElementById("locationStatus"),
  locationButton: document.getElementById("locationButton"),
  trackingFeed: document.getElementById("trackingFeed"),
  mobileMap: document.getElementById("mobileMap"),
  mapViewport: document.getElementById("mapViewport"),
  mapDots: document.getElementById("mapDots"),
  mapZoomRange: document.getElementById("mapZoomRange"),
  mapZoomIn: document.getElementById("mapZoomIn"),
  mapZoomOut: document.getElementById("mapZoomOut"),
  mapResetButton: document.getElementById("mapResetButton"),
  projectPinModeButton: document.getElementById("projectPinModeButton"),
  mapExpandButton: document.getElementById("mapExpandButton"),
  mapCollapseButton: document.getElementById("mapCollapseButton"),
  mapCard: document.getElementById("mapCard"),
  mapFocusTitle: document.getElementById("mapFocusTitle"),
  mapFocusMeta: document.getElementById("mapFocusMeta"),
  mapFocusStats: document.getElementById("mapFocusStats"),
  summaryCards: document.getElementById("summaryCards"),
  sessionPanel: document.getElementById("sessionPanel"),
  logoutButton: document.getElementById("logoutButton"),
};

const projectLocationMaster = {
  India: {
    TamilNadu: ["Chennai", "Coimbatore", "Madurai", "Salem"],
    Karnataka: ["Bengaluru", "Mysuru", "Hubballi", "Mangaluru"],
    Maharashtra: ["Mumbai", "Pune", "Nagpur", "Nashik"],
  },
  UAE: {
    Dubai: ["Deira", "Bur Dubai", "Jebel Ali"],
    AbuDhabi: ["Abu Dhabi City", "Mussafah", "Al Ain"],
  },
  Singapore: {
    Central: ["Orchard", "Marina", "Novena"],
    West: ["Jurong", "Clementi", "Bukit Batok"],
  }
};

const registrationGuides = {
  WORKER: {
    title: "Worker registration",
    text: "This format is best for skilled manpower, operators, helpers, field workers, and trade workers.",
    checklist: [
      "Keep mobile number and city ready.",
      "Choose industry first, then matching skill.",
      "Add duty choice, wage, and visibility clearly.",
      "Use short notes only if needed.",
    ],
    readiness: [
      "Basic identity",
      "Work profile",
      "Shift and wages",
      "Ready to register",
    ],
  },
  ENGINEER: {
    title: "Professional registration",
    text: "This format is best for educated candidates like engineers, supervisors, office staff, planners, QA/QC, and coordinators.",
    checklist: [
      "Keep email, employer, and designation ready.",
      "Add current salary and expected salary correctly.",
      "Paste a short resume summary with projects and software.",
      "Choose notice period before submitting.",
    ],
    readiness: [
      "Professional identity",
      "Education and role",
      "Employer and salary",
      "Resume summary ready",
    ],
  },
};

const engineerTaxonomy = {
  Diploma: {
    Civil: {
      roles: ["Site Supervisor", "Billing Engineer", "QA/QC Supervisor", "Survey Assistant"],
      specializations: ["AutoCAD", "Quantity Surveying", "Site Execution", "Billing and Estimation"],
    },
    Electrical: {
      roles: ["Electrical Supervisor", "Maintenance Engineer", "Testing Technician", "Panel Supervisor"],
      specializations: ["HT/LT Panels", "Site Electrical", "Maintenance", "Testing and Commissioning"],
    },
    Mechanical: {
      roles: ["Mechanical Supervisor", "Piping Supervisor", "Maintenance Supervisor", "Fabrication Supervisor"],
      specializations: ["Piping", "Fabrication", "Rotating Equipment", "Maintenance Planning"],
    },
    IT: {
      roles: ["Desktop Support", "Network Technician", "System Support Engineer", "Hardware Technician"],
      specializations: ["Hardware Support", "Networking", "Windows Support", "Printer and Device Support"],
    },
  },
  "B.Tech / BE": {
    Civil: {
      roles: ["Site Engineer", "Project Engineer", "Planning Engineer", "QA/QC Engineer"],
      specializations: ["Execution", "Planning", "Billing", "QA/QC", "Quantity Surveying", "Contracts"],
    },
    Electrical: {
      roles: ["Electrical Engineer", "Project Engineer", "Testing Engineer", "Commissioning Engineer"],
      specializations: ["Power Systems", "Substation", "HT/LT", "Testing and Commissioning", "Industrial Electrical"],
    },
    Mechanical: {
      roles: ["Mechanical Engineer", "Piping Engineer", "Maintenance Engineer", "Production Engineer"],
      specializations: ["Piping", "Rotating Equipment", "Maintenance", "Fabrication", "Production"],
    },
    IT: {
      roles: ["Software Engineer", "Full Stack Developer", "Frontend Developer", "Backend Developer", "DevOps Engineer", "QA Engineer"],
      specializations: ["Java", "Python", "Node.js", "React", "Angular", "DevOps", "Testing Automation", "Cloud"],
    },
    Electronics: {
      roles: ["Automation Engineer", "Instrumentation Engineer", "Embedded Engineer", "Service Engineer"],
      specializations: ["PLC/SCADA", "Instrumentation", "Embedded Systems", "Control Systems"],
    },
  },
  "M.Tech / ME": {
    Civil: {
      roles: ["Senior Planning Engineer", "Design Engineer", "Project Controls Engineer"],
      specializations: ["Project Controls", "Structural Design", "Advanced Planning", "Contracts"],
    },
    Electrical: {
      roles: ["Senior Electrical Engineer", "Design Engineer", "Protection Engineer"],
      specializations: ["Electrical Design", "Protection Systems", "Power Quality", "Commissioning"],
    },
    Mechanical: {
      roles: ["Senior Mechanical Engineer", "Design Engineer", "Reliability Engineer"],
      specializations: ["Design", "Reliability", "Project Engineering", "Thermal Systems"],
    },
    IT: {
      roles: ["Solution Architect", "Data Engineer", "AI Engineer", "Cybersecurity Engineer"],
      specializations: ["Artificial Intelligence", "Machine Learning", "Data Engineering", "Cloud Architecture", "Cybersecurity"],
    },
  },
  MBA: {
    Operations: {
      roles: ["Operations Executive", "Project Coordinator", "Business Development Manager"],
      specializations: ["Operations", "Client Coordination", "Vendor Management", "Business Development"],
    },
    HR: {
      roles: ["HR Executive", "Talent Acquisition Specialist", "HR Manager"],
      specializations: ["Recruitment", "Payroll", "Employee Relations", "HR Operations"],
    },
    Finance: {
      roles: ["Finance Executive", "Accounts Manager", "MIS Analyst"],
      specializations: ["Accounts", "Financial Planning", "MIS", "Budgeting"],
    },
    Marketing: {
      roles: ["Marketing Executive", "Digital Marketing Specialist", "Brand Coordinator"],
      specializations: ["Digital Marketing", "Sales Support", "Campaign Management", "Branding"],
    },
  },
  "B.Sc / B.Com / BA": {
    Accounts: {
      roles: ["Accountant", "Billing Executive", "MIS Executive"],
      specializations: ["Tally", "GST", "Billing", "MIS Reporting"],
    },
    Administration: {
      roles: ["Office Executive", "Admin Executive", "Documentation Executive"],
      specializations: ["Administration", "Documentation", "Data Entry", "Coordination"],
    },
    IT: {
      roles: ["Support Executive", "Data Analyst", "Web Support Executive"],
      specializations: ["Excel", "SQL", "Basic Web Support", "Reporting"],
    },
    HR: {
      roles: ["HR Coordinator", "Recruitment Executive", "Back Office HR"],
      specializations: ["Recruitment", "Joining Formalities", "Database Management", "HR Coordination"],
    },
  },
  "Other Graduate": {
    Technical: {
      roles: ["Technical Coordinator", "Estimator", "Support Engineer"],
      specializations: ["Coordination", "Technical Documentation", "Support", "Estimation"],
    },
    NonTechnical: {
      roles: ["Back Office Executive", "Client Coordinator", "Operations Assistant"],
      specializations: ["Operations Support", "Client Handling", "Documentation", "Reporting"],
    },
  },
};

async function api(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (state.session?.token) {
    headers.Authorization = `Bearer ${state.session.token}`;
  }

  const response = await fetch(path, { ...options, headers });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }
  return data;
}

async function fetchProtectedFile(path) {
  const headers = {};
  if (state.session?.token) {
    headers.Authorization = `Bearer ${state.session.token}`;
  }
  const response = await fetch(path, { headers });
  if (!response.ok) {
    let message = "File request failed";
    try {
      const data = await response.json();
      message = data.message || message;
    } catch {}
    throw new Error(message);
  }
  const blob = await response.blob();
  return {
    blob,
    contentType: response.headers.get("content-type") || "application/octet-stream",
  };
}

async function loadBootstrap() {
  const data = await api("/api/bootstrap");
  state.bootstrap = data;

  el.loginRole.innerHTML = data.roles
    .map((role) => `<option value="${role.code}">${role.label}</option>`)
    .join("");

  el.workerIndustry.innerHTML = `<option value="">Select industry</option>${data.categories
    .map((category) => `<option value="${category.code}">${category.name}</option>`)
    .join("")}`;

  el.otpHint.textContent = `Login numbers: ${data.demoUsers
    .map((user) => `${user.role} ${user.mobile}`)
    .join(" | ")}`;

  updateSkillOptions();
  populateProjectCountries();
}

function updateSkillOptions() {
  const selected = state.bootstrap?.categories.find((category) => category.code === el.workerIndustry.value);
  el.workerSkill.innerHTML = `<option value="">Select skill</option>${
    selected ? selected.skills.map((skill) => `<option value="${skill}">${skill}</option>`).join("") : ""
  }`;
}

function populateProjectCountries() {
  const countries = Object.keys(projectLocationMaster);
  el.projectCountry.innerHTML = `<option value="">Select country</option>${countries
    .map((country) => `<option value="${country}">${country}</option>`)
    .join("")}`;
  el.projectState.innerHTML = `<option value="">Select state</option>`;
  el.projectDistrict.innerHTML = `<option value="">Select district</option>`;
}

function populateProjectStates() {
  const country = el.projectCountry.value;
  const states = country ? Object.keys(projectLocationMaster[country] || {}) : [];
  el.projectState.innerHTML = `<option value="">Select state</option>${states
    .map((state) => `<option value="${state}">${state}</option>`)
    .join("")}`;
  el.projectDistrict.innerHTML = `<option value="">Select district</option>`;
}

function populateProjectDistricts() {
  const country = el.projectCountry.value;
  const state = el.projectState.value;
  const districts = country && state ? (projectLocationMaster[country]?.[state] || []) : [];
  el.projectDistrict.innerHTML = `<option value="">Select district</option>${districts
    .map((district) => `<option value="${district}">${district}</option>`)
    .join("")}`;
}

function setBanner(message, variant = "info") {
  el.authBanner.className = `banner ${variant}`;
  el.authBanner.textContent = message;
}

function populateProfessionalFilters(engineers = []) {
  const unique = (values) => [...new Set(values.filter(Boolean))].sort();
  const educations = unique(engineers.map((item) => item.educationLevel));
  const fields = unique(engineers.map((item) => item.professionalField));
  const notices = unique(engineers.map((item) => item.noticePeriod));

  el.professionalFilterEducation.innerHTML = `<option value="">All education</option>${educations
    .map((item) => `<option value="${item}">${item}</option>`)
    .join("")}`;
  el.professionalFilterField.innerHTML = `<option value="">All fields</option>${fields
    .map((item) => `<option value="${item}">${item}</option>`)
    .join("")}`;
  el.professionalFilterNotice.innerHTML = `<option value="">All notice periods</option>${notices
    .map((item) => `<option value="${item}">${item}</option>`)
    .join("")}`;
}

function populateWorkerFilters(workers = []) {
  const categories = [...new Set(workers.map((item) => item.categoryName).filter(Boolean))].sort();
  el.workerFilterCategory.innerHTML = `<option value="">All industries</option>${categories
    .map((item) => `<option value="${item}">${item}</option>`)
    .join("")}`;
}

function renderWorkerTable() {
  const workers = state.dashboard?.workers || [];
  const category = el.workerFilterCategory.value;
  const cityText = (el.workerFilterCity.value || "").trim().toLowerCase();
  const skillText = (el.workerFilterSkill.value || "").trim().toLowerCase();
  const status = el.workerFilterStatus.value;
  const userRole = state.session?.user?.role;

  const filtered = workers.filter((worker) => {
    if (category && worker.categoryName !== category) return false;
    if (status && worker.workerStatus !== status) return false;
    if (cityText && !String(worker.city || "").toLowerCase().includes(cityText)) return false;
    if (skillText && !String(worker.skillName || "").toLowerCase().includes(skillText)) return false;
    return true;
  });

  el.workerTableBody.innerHTML = filtered
    .map(
      (worker) => `
        <tr>
          <td>${worker.workerCode}</td>
          <td>${worker.fullName}</td>
          <td>${worker.categoryName}</td>
          <td>${worker.skillName}</td>
          <td>${worker.city}</td>
          <td>${worker.availabilityStatus}</td>
          <td>${worker.shiftPreference || "DAY"}</td>
          <td>Day Rs ${worker.preferredDayWage || 0} | Night Rs ${worker.preferredNightWage || 0}</td>
          <td><span class="tag ${worker.workerStatus.toLowerCase()}">${worker.workerStatus}</span></td>
          <td>${userRole === "ADMIN" ? `
            <div class="table-actions">
              <button class="ghost-btn registry-action" data-type="worker" data-id="${worker.id}" data-status="APPROVED" type="button">Approve</button>
              <button class="ghost-btn registry-action" data-type="worker" data-id="${worker.id}" data-status="REJECTED" type="button">Reject</button>
            </div>
          ` : "-"}</td>
        </tr>
      `
    )
    .join("") || `<tr><td colspan="10">No workers found for the selected filters.</td></tr>`;
}

function renderProfessionalTable() {
  const engineers = state.dashboard?.engineers || [];
  const education = el.professionalFilterEducation.value;
  const field = el.professionalFilterField.value;
  const roleText = (el.professionalFilterRole.value || "").trim().toLowerCase();
  const notice = el.professionalFilterNotice.value;

  const filtered = engineers.filter((item) => {
    if (education && item.educationLevel !== education) return false;
    if (field && item.professionalField !== field) return false;
    if (notice && item.noticePeriod !== notice) return false;
    if (roleText && !`${item.professionalCategory} ${item.specialization}`.toLowerCase().includes(roleText)) return false;
    return true;
  });

  el.professionalTableBody.innerHTML = filtered
    .map(
      (item) => `
        <tr>
          <td>${item.engineerCode}</td>
          <td>${item.fullName}</td>
          <td>${item.educationLevel}</td>
          <td>${item.professionalField}</td>
          <td>${item.professionalCategory}<br /><span class="muted">${item.specialization}</span></td>
          <td>${item.currentEmployer}<br /><span class="muted">${item.currentDesignation}</span></td>
          <td>Current Rs ${item.currentSalary}<br /><span class="muted">Expected Rs ${item.expectedSalary}</span></td>
          <td>${item.noticePeriod}</td>
          <td>${item.resumeAttachment?.fileName ? `
            <div class="table-actions">
              <span>${item.resumeAttachment.fileName}</span>
              <button class="ghost-btn resume-action" data-id="${item.id}" data-mode="view" type="button">View</button>
              <button class="ghost-btn resume-action" data-id="${item.id}" data-mode="download" type="button">Download</button>
            </div>
          ` : "No file"}</td>
          <td>${item.preScreened ? '<span class="tag approved">Pre Screened</span>' : '<span class="tag pending">Pending</span>'}</td>
          <td>${item.preScreenComments ? item.preScreenComments : "No expert comment yet"}</td>
          <td><span class="tag ${String((item.candidateStatus || "PENDING")).toLowerCase()}">${item.candidateStatus || "PENDING"}</span></td>
          <td>${state.session?.user?.role === "ADMIN" ? `
            <div class="table-actions">
              <button class="ghost-btn registry-action" data-type="engineer" data-id="${item.id}" data-status="APPROVED" type="button">Approve</button>
              <button class="ghost-btn registry-action" data-type="engineer" data-id="${item.id}" data-status="REJECTED" type="button">Reject</button>
              <button class="ghost-btn prescreen-action" data-id="${item.id}" type="button">Pre Screen</button>
            </div>
          ` : "-"}</td>
        </tr>
      `
    )
    .join("") || `<tr><td colspan="13">No professional candidates found for the selected filters.</td></tr>`;
}

function renderRegistrationSection() {
  const mode = el.registrationClass?.value || "WORKER";
  if (el.workerRegistrationSection) {
    el.workerRegistrationSection.hidden = mode !== "WORKER";
  }
  if (el.engineerRegistrationSection) {
    el.engineerRegistrationSection.hidden = mode !== "ENGINEER";
  }
  const guide = registrationGuides[mode] || registrationGuides.WORKER;
  if (el.registrationGuideTitle) {
    el.registrationGuideTitle.textContent = guide.title;
  }
  if (el.registrationGuideText) {
    el.registrationGuideText.textContent = guide.text;
  }
  if (el.registrationChecklist) {
    el.registrationChecklist.innerHTML = guide.checklist
      .map((item) => `<div class="check-item">${item}</div>`)
      .join("");
  }
  if (el.registrationReadiness) {
    el.registrationReadiness.innerHTML = guide.readiness
      .map((item, index) => `<div class="readiness-item"><span>${index + 1}</span><strong>${item}</strong></div>`)
      .join("");
  }
}

function populateEngineerFields() {
  const education = el.engineerEducation?.value || "";
  const fields = education ? Object.keys(engineerTaxonomy[education] || {}) : [];
  if (el.engineerField) {
    el.engineerField.innerHTML = `<option value="">Select field</option>${fields
      .map((field) => `<option value="${field}">${field}</option>`)
      .join("")}<option value="Other">Other</option>`;
  }
  toggleOtherInput(el.engineerField, el.engineerFieldOtherWrap, el.engineerFieldOther);
  populateEngineerRoles();
}

function populateEngineerRoles() {
  const education = el.engineerEducation?.value || "";
  const field = el.engineerField?.value || "";
  const config = education && field ? engineerTaxonomy[education]?.[field] : null;
  if (el.engineerCategory) {
    el.engineerCategory.innerHTML = `<option value="">Select role</option>${(config?.roles || [])
      .map((role) => `<option value="${role}">${role}</option>`)
      .join("")}<option value="Other">Other</option>`;
  }
  if (el.engineerSpecialization) {
    el.engineerSpecialization.innerHTML = `<option value="">Select specialization</option>${(config?.specializations || [])
      .map((item) => `<option value="${item}">${item}</option>`)
      .join("")}<option value="Other">Other</option>`;
  }
  toggleOtherInput(el.engineerCategory, el.engineerCategoryOtherWrap, el.engineerCategoryOther);
  toggleOtherInput(el.engineerSpecialization, el.engineerSpecializationOtherWrap, el.engineerSpecializationOther);
}

function toggleOtherInput(selectEl, wrapEl, inputEl) {
  if (!selectEl || !wrapEl || !inputEl) return;
  const active = selectEl.value === "Other";
  wrapEl.hidden = !active;
  inputEl.required = active;
  if (!active) {
    inputEl.value = "";
  }
}

function selectedOrOther(selectEl, inputEl) {
  if (!selectEl) return "";
  if (selectEl.value === "Other") {
    return String(inputEl?.value || "").trim();
  }
  return selectEl.value;
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Unable to read resume file."));
    reader.readAsDataURL(file);
  });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function setMapExpanded(expanded) {
  state.map.expanded = expanded;
  el.mapCard.classList.toggle("is-collapsed", !expanded);
  el.mapCard.classList.toggle("is-expanded", expanded);
  el.mapExpandButton.hidden = expanded;
  el.mapCollapseButton.hidden = !expanded;
}

function setProjectPinMode(active) {
  state.map.projectPinMode = active;
  el.projectPinModeButton.classList.toggle("is-active", active);
  el.mobileMap.classList.toggle("is-picking", active);
  el.projectPinModeButton.textContent = active ? "Picking project pin..." : "Pick project pin";
  if (active) {
    setBanner("Tap the map to set exact project coordinates.", "info");
  }
}

function setMapZoom(zoom) {
  const safeZoom = Math.max(1, Math.min(4, zoom));
  state.map.zoom = safeZoom;
  el.mapZoomRange.value = String(Math.round(safeZoom * 100));
  el.mapViewport.style.transform = `scale(${safeZoom})`;
}

function updateMapFocus(item) {
  if (!item) {
    el.mapFocusTitle.textContent = "Tap a dot";
    el.mapFocusMeta.textContent = "Select any worker, client, or project to see location detail.";
    el.mapFocusStats.innerHTML = "";
    return;
  }

  el.mapFocusTitle.textContent = item.name;
  el.mapFocusMeta.textContent = item.role === "PROJECT"
    ? `${item.label}`
    : `${item.roleLabel || item.role} | ${item.mobile || "Live map point"}`;
  el.mapFocusStats.innerHTML = `
    <div class="focus-stat">
      <span>Type</span>
      <strong>${item.role === "PROJECT" ? "Project Site" : item.roleLabel || item.role}</strong>
    </div>
    <div class="focus-stat">
      <span>Latitude</span>
      <strong>${Number(item.latitude).toFixed(5)}</strong>
    </div>
    <div class="focus-stat">
      <span>Longitude</span>
      <strong>${Number(item.longitude).toFixed(5)}</strong>
    </div>
    <div class="focus-stat">
      <span>Label</span>
      <strong>${escapeHtml(item.label || "Live position")}</strong>
    </div>
  `;
}

function getDefaultMapBounds() {
  return { minLat: 6, maxLat: 38, minLng: 68, maxLng: 97 };
}

function pointToLatLng(leftPercent, topPercent) {
  const bounds = state.map.bounds || getDefaultMapBounds();
  const latitude = bounds.minLat + (1 - (topPercent - 12) / 76) * (bounds.maxLat - bounds.minLat);
  const longitude = bounds.minLng + ((leftPercent - 10) / 80) * (bounds.maxLng - bounds.minLng);
  return {
    latitude: Number(latitude.toFixed(6)),
    longitude: Number(longitude.toFixed(6)),
  };
}

function renderDashboard() {
  if (!state.dashboard || !state.session) {
    el.dashboardTitle.textContent = "Login with mobile number to continue";
    el.dashboardSubtitle.textContent = "Each role gets its own safe dashboard and simple options.";
    el.dashboardCards.innerHTML = "";
    el.workerTableBody.innerHTML = "";
    el.professionalTableBody.innerHTML = "";
    el.trackingFeed.innerHTML = "";
    el.summaryCards.innerHTML = "";
    el.mapDots.innerHTML = "";
    el.aiInsights.innerHTML = "";
    el.offerFeed.innerHTML = "";
    el.nearbyMatchFeed.innerHTML = "";
    el.notificationFeed.innerHTML = "";
    el.registryPanel.hidden = true;
    el.professionalRegistryPanel.hidden = true;
    el.sessionPanel.hidden = true;
    el.workerPreferencePanel.hidden = true;
    el.clientOfferPanel.hidden = true;
    updateMapFocus(null);
    return;
  }

  const { user } = state.session;
  const myWorkerProfile = state.dashboard.myWorkerProfile || null;
  const nearbyAlertsEnabled = state.dashboard.alertPreferences?.nearbyAlertsEnabled !== false;
  el.sessionPanel.hidden = false;
  el.dashboardTitle.textContent = `${user.roleLabel} dashboard`;
  el.dashboardSubtitle.textContent = `${user.fullName} | ${user.mobile} | ${user.email}`;
  el.sessionPanel.innerHTML = `
    <div class="session-card">
      <span>Signed In</span>
      <strong>${user.fullName}</strong>
      <p>${user.roleLabel} | ${user.mobile}</p>
    </div>
    <div class="session-card">
      <span>Domain</span>
      <strong>skill.quantproc.com</strong>
      <p>Mobile OTP + live location enabled</p>
    </div>
  `;

  el.alertNearbyEnabled.value = nearbyAlertsEnabled ? "true" : "false";
  el.alertPreferenceStatus.textContent = nearbyAlertsEnabled
    ? "Nearby alerts are currently on."
    : "Nearby alerts are currently off.";

  el.dashboardCards.innerHTML = state.dashboard.cards
    .map(
      (card) => `
        <article class="dashboard-card">
          <h3>${card.title}</h3>
          <p>${card.description}</p>
        </article>
      `
    )
    .join("");

  el.summaryCards.innerHTML = `
    <div class="summary-card">
      <span>Total Workers</span>
      <strong>${state.dashboard.stats.totalWorkers}</strong>
    </div>
    <div class="summary-card">
      <span>Approved Workers</span>
      <strong>${state.dashboard.stats.approvedWorkers}</strong>
    </div>
    <div class="summary-card">
      <span>Clients Live</span>
      <strong>${state.dashboard.stats.clientsTracked}</strong>
    </div>
    <div class="summary-card">
      <span>Workers Live</span>
      <strong>${state.dashboard.stats.workersTracked}</strong>
    </div>
    <div class="summary-card">
      <span>Pending Offers</span>
      <strong>${state.dashboard.stats.pendingOffers}</strong>
    </div>
    <div class="summary-card">
      <span>Professionals</span>
      <strong>${state.dashboard.stats.totalProfessionals || 0}</strong>
    </div>
  `;

  const canViewRegistry = ["ADMIN", "AMBASSADOR", "CLIENT"].includes(user.role);
  el.registryPanel.hidden = !canViewRegistry;
  el.professionalRegistryPanel.hidden = !canViewRegistry;
  populateWorkerFilters(state.dashboard.workers || []);
  renderWorkerTable();
  populateProfessionalFilters(state.dashboard.engineers || []);
  renderProfessionalTable();

  el.trackingFeed.innerHTML = state.dashboard.locations
    .map(
      (item) => `
        <article class="feed-card">
          <strong>${item.name}</strong>
          <p>${item.roleLabel} | ${item.mobile}</p>
          <p>${item.label}</p>
          <p>Lat ${item.latitude.toFixed(5)}, Lng ${item.longitude.toFixed(5)}</p>
          <p>Updated ${new Date(item.capturedAt).toLocaleString()}</p>
        </article>
      `
    )
    .join("") + (state.dashboard.projectLocations || [])
    .map(
      (project) => `
        <article class="feed-card">
          <strong>${project.siteName}</strong>
          <p>Project Site | ${project.clientName}</p>
          <p>${project.streetAddress}</p>
          <p>${project.district}, ${project.state}, ${project.country}</p>
        </article>
      `
    )
    .join("");

  el.aiInsights.innerHTML = (state.dashboard.aiInsights || [])
    .map(
      (item) => `
        <div class="stack-item">
          <strong>${item.title}</strong>
          <p>${item.message}</p>
        </div>
      `
    )
    .join("") || `<div class="stack-item"><strong>System ready</strong><p>Login to see wage and duty suggestions.</p></div>`;

  el.workerPreferencePanel.hidden = user.role !== "WORKER";
  if (user.role === "WORKER" && myWorkerProfile) {
    el.prefVisibility.value = myWorkerProfile.visibilityStatus || "VISIBLE";
    el.prefShiftPreference.value = myWorkerProfile.shiftPreference || "DAY";
    el.prefDayWage.value = myWorkerProfile.preferredDayWage || 0;
    el.prefNightWage.value = myWorkerProfile.preferredNightWage || 0;
    el.prefWageFlexibility.value = myWorkerProfile.wageFlexibility || "NEGOTIABLE";
    el.prefServiceRadiusKm.value = myWorkerProfile.serviceRadiusKm || 25;
    el.prefLiveStatus.value = myWorkerProfile.liveStatus || "AVAILABLE";
    el.workerPreferenceStatus.textContent =
      `Current setting: ${myWorkerProfile.visibilityStatus || "VISIBLE"} | ${myWorkerProfile.shiftPreference || "DAY"} | Day Rs ${myWorkerProfile.preferredDayWage || 0} | Night Rs ${myWorkerProfile.preferredNightWage || 0} | Radius ${myWorkerProfile.serviceRadiusKm || 25} km`;
  }

  el.clientOfferPanel.hidden = user.role !== "CLIENT";
  if (user.role === "CLIENT") {
    const workerOptions = (state.dashboard.workers || [])
      .map(
        (worker) =>
          `<option value="${worker.id}">${worker.fullName} | ${worker.skillName} | Day Rs ${worker.preferredDayWage || 0} | Night Rs ${worker.preferredNightWage || 0}</option>`
      )
      .join("");
    el.offerWorkerId.innerHTML = workerOptions || `<option value="">No visible worker available</option>`;
    if (!workerOptions) {
      el.clientOfferStatus.textContent = "No visible worker available right now. Hidden workers are not shown.";
    }
  }

  el.offerFeed.innerHTML = (state.dashboard.wageOffers || [])
    .map((offer) => {
      const workerActions =
        user.role === "WORKER" && offer.status === "PENDING"
          ? `
            <div class="offer-actions">
              <button class="primary-btn offer-action" data-offer-id="${offer.id}" data-action="ACCEPT">Accept</button>
              <button class="ghost-btn offer-action" data-offer-id="${offer.id}" data-action="DECLINE">Decline</button>
            </div>
          `
          : "";
      return `
        <article class="feed-card">
          <strong>${offer.workerName}</strong>
          <p>Client ${offer.clientName} | Shift ${offer.shiftType}</p>
          <p>Offer: Day Rs ${offer.offeredDayWage} | Night Rs ${offer.offeredNightWage}</p>
          <p>Status: ${offer.status}</p>
          <p>${offer.message || "No message added."}</p>
          <p>${offer.aiSummary || ""}</p>
          ${workerActions}
        </article>
      `;
    })
    .join("") || `<article class="feed-card"><strong>No active offers</strong><p>Offers will appear here for clients and workers.</p></article>`;

  el.notificationFeed.innerHTML = (state.dashboard.notifications || [])
    .map(
      (item) => `
        <article class="feed-card">
          <strong>${item.title}</strong>
          <p>${item.message}</p>
          <p>${new Date(item.createdAt).toLocaleString()}</p>
          ${item.readAt ? `<p>Status: Read</p>` : `<button class="ghost-btn notification-action" data-notification-id="${item.id}" type="button">Mark read</button>`}
        </article>
      `
    )
    .join("") || `<article class="feed-card"><strong>No notifications yet</strong><p>Auto alerts will appear when nearby matches are detected.</p></article>`;

  el.nearbyMatchFeed.innerHTML = (state.dashboard.nearbyMatches || [])
    .map(
      (match) => `
        <article class="feed-card">
          <strong>${match.workerName}</strong>
          <p>${match.matchType} | ${match.targetName}</p>
          <p>${match.distanceKm} km away | Radius ${match.serviceRadiusKm} km</p>
          <p>${match.summary}</p>
        </article>
      `
    )
    .join("") || `<article class="feed-card"><strong>No nearby auto-matches yet</strong><p>Set worker radius, share live location, and save project/client location to activate smart nearby matching.</p></article>`;

  renderMap(state.dashboard.locations, state.dashboard.projectLocations || []);
}

function locationToPoint(project, index) {
  if (Number.isFinite(Number(project.latitude)) && Number.isFinite(Number(project.longitude))) {
    return {
      id: project.id,
      name: project.siteName,
      role: "PROJECT",
      label: `${project.streetAddress} | ${project.district}, ${project.state}, ${project.country}`,
      latitude: Number(project.latitude),
      longitude: Number(project.longitude),
    };
  }
  const key = `${project.country}|${project.state}|${project.district}|${project.streetAddress}|${project.siteName}`;
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = ((hash << 5) - hash + key.charCodeAt(i)) | 0;
  }
  return {
    name: project.siteName,
    role: "PROJECT",
    label: `${project.district}, ${project.state}, ${project.country}`,
    latitude: 8 + Math.abs(hash % 70) + index * 0.01,
    longitude: 68 + Math.abs((hash >> 3) % 70) + index * 0.01,
  };
}

function renderMap(locations, projectLocations = []) {
  const merged = [
    ...(Array.isArray(locations) ? locations : []),
    ...projectLocations.map((project, index) => ({ ...locationToPoint(project, index), id: project.id })),
  ];

  if (merged.length === 0) {
    state.map.bounds = getDefaultMapBounds();
    const draftMarkup = state.map.projectDraftPoint
      ? `
        <button class="map-point project draft is-active" style="left:${state.map.projectDraftPoint.left}%; top:${state.map.projectDraftPoint.top}%;" type="button">
          <span class="dot"></span>
          <label>Draft Project Pin</label>
        </button>
      `
      : "";
    el.mapDots.innerHTML = draftMarkup;
    updateMapFocus(null);
    return;
  }

  const lats = merged.map((item) => Number(item.latitude));
  const lngs = merged.map((item) => Number(item.longitude));
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const latRange = Math.max(maxLat - minLat, 0.01);
  const lngRange = Math.max(maxLng - minLng, 0.01);
  state.map.bounds = { minLat, maxLat, minLng, maxLng };

  const selectedId = state.map.selectedId || merged[0]?.id || merged[0]?.userId || merged[0]?.name;

  el.mapDots.innerHTML = merged
    .map((item) => {
      const left = 10 + ((Number(item.longitude) - minLng) / lngRange) * 80;
      const top = 12 + (1 - (Number(item.latitude) - minLat) / latRange) * 76;
      const typeClass = item.role === "WORKER" ? "worker" : item.role === "CLIENT" ? "client" : "project";
      const itemId = item.id || item.userId || item.name;
      return `
        <button class="map-point ${typeClass} ${itemId === selectedId ? "is-active" : ""}" data-point-id="${escapeHtml(itemId)}" style="left:${left}%; top:${top}%;" type="button">
          <span class="dot"></span>
          <label>${escapeHtml(item.name)}</label>
        </button>
      `;
    })
    .join("") + (state.map.projectDraftPoint
      ? `
        <button class="map-point project draft is-active" style="left:${state.map.projectDraftPoint.left}%; top:${state.map.projectDraftPoint.top}%;" type="button">
          <span class="dot"></span>
          <label>Draft Project Pin</label>
        </button>
      `
      : "");

  const selectedItem = merged.find((item) => (item.id || item.userId || item.name) === selectedId) || merged[0];
  state.map.selectedId = selectedItem.id || selectedItem.userId || selectedItem.name;
  updateMapFocus(selectedItem);
}

async function loadDashboard() {
  state.dashboard = await api("/api/dashboard");
  renderDashboard();
}

el.workerIndustry.addEventListener("change", updateSkillOptions);
el.projectCountry.addEventListener("change", populateProjectStates);
el.projectState.addEventListener("change", populateProjectDistricts);
el.registrationClass?.addEventListener("change", renderRegistrationSection);
el.workerFilterCategory?.addEventListener("change", renderWorkerTable);
el.workerFilterCity?.addEventListener("input", renderWorkerTable);
el.workerFilterSkill?.addEventListener("input", renderWorkerTable);
el.workerFilterStatus?.addEventListener("change", renderWorkerTable);
el.professionalFilterEducation?.addEventListener("change", renderProfessionalTable);
el.professionalFilterField?.addEventListener("change", renderProfessionalTable);
el.professionalFilterRole?.addEventListener("input", renderProfessionalTable);
el.professionalFilterNotice?.addEventListener("change", renderProfessionalTable);
el.engineerEducation?.addEventListener("change", populateEngineerFields);
el.engineerField?.addEventListener("change", () => {
  toggleOtherInput(el.engineerField, el.engineerFieldOtherWrap, el.engineerFieldOther);
  populateEngineerRoles();
});
el.engineerCategory?.addEventListener("change", () => {
  toggleOtherInput(el.engineerCategory, el.engineerCategoryOtherWrap, el.engineerCategoryOther);
});
el.engineerSpecialization?.addEventListener("change", () => {
  toggleOtherInput(el.engineerSpecialization, el.engineerSpecializationOtherWrap, el.engineerSpecializationOther);
});

el.requestOtpForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const payload = {
      role: el.loginRole.value,
      mobile: el.loginMobile.value.trim(),
    };
    const data = await api("/api/auth/request-otp", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    state.otpContext = payload;
    if (data.demoOtp) {
      el.otpCode.value = data.demoOtp;
      setBanner(`OTP sent. Demo OTP is ${data.demoOtp}.`, "success");
    } else {
      el.otpCode.value = "";
      setBanner("OTP sent to your mobile number. Enter the OTP to login.", "success");
    }
  } catch (error) {
    setBanner(error.message, "error");
  }
});

el.verifyOtpForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    if (!state.otpContext) {
      throw new Error("First click Get OTP.");
    }
    const data = await api("/api/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({
        ...state.otpContext,
        otp: el.otpCode.value.trim(),
      }),
    });
    state.session = data;
    setBanner(`Login successful. Welcome ${data.user.fullName}.`, "success");
    await loadDashboard();
  } catch (error) {
    setBanner(error.message, "error");
  }
});

el.workerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const payload = {
      fullName: document.getElementById("workerName").value.trim(),
      mobile: document.getElementById("workerPhone").value.trim(),
      email: document.getElementById("workerEmail").value.trim(),
      city: document.getElementById("workerCity").value.trim(),
      categoryCode: el.workerIndustry.value,
      skillName: el.workerSkill.value,
      experienceBand: document.getElementById("workerExperience").value,
      availabilityStatus: document.getElementById("workerAvailability").value,
      visibilityStatus: el.workerVisibility.value,
      shiftPreference: el.workerShiftPreference.value,
      preferredDayWage: Number(el.workerPreferredDayWage.value),
      preferredNightWage: Number(el.workerPreferredNightWage.value),
      wageFlexibility: el.workerWageFlexibility.value,
      notes: document.getElementById("workerNotes").value.trim(),
    };
    await api("/api/workers/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    setBanner("Worker registered successfully.", "success");
    el.workerForm.reset();
    updateSkillOptions();
    if (state.session) {
      await loadDashboard();
    }
  } catch (error) {
    setBanner(error.message, "error");
  }
});

el.engineerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    let resumeAttachment = null;
    const resumeFile = el.engineerResumeFile?.files?.[0];
    if (resumeFile) {
      resumeAttachment = {
        fileName: resumeFile.name,
        fileType: resumeFile.type || "application/octet-stream",
        dataUrl: await readFileAsDataUrl(resumeFile),
      };
    }
    await api("/api/engineers/register", {
      method: "POST",
      body: JSON.stringify({
        fullName: document.getElementById("engineerName").value.trim(),
        mobile: document.getElementById("engineerPhone").value.trim(),
        email: document.getElementById("engineerEmail").value.trim(),
        city: document.getElementById("engineerCity").value.trim(),
        educationLevel: document.getElementById("engineerEducation").value,
        professionalField: selectedOrOther(el.engineerField, el.engineerFieldOther),
        professionalCategory: selectedOrOther(el.engineerCategory, el.engineerCategoryOther),
        specialization: selectedOrOther(el.engineerSpecialization, el.engineerSpecializationOther),
        experienceBand: document.getElementById("engineerExperience").value,
        currentEmployer: document.getElementById("engineerCurrentEmployer").value.trim(),
        currentDesignation: document.getElementById("engineerCurrentDesignation").value.trim(),
        currentSalary: Number(document.getElementById("engineerCurrentSalary").value),
        expectedSalary: Number(document.getElementById("engineerExpectedSalary").value),
        noticePeriod: document.getElementById("engineerNoticePeriod").value,
        resumeSummary: document.getElementById("engineerResume").value.trim(),
        resumeAttachment,
      }),
    });
    setBanner("Professional candidate registered successfully.", "success");
    el.engineerStatus.textContent = "Professional candidate profile saved successfully.";
    el.engineerForm.reset();
    if (state.session) {
      await loadDashboard();
    }
  } catch (error) {
    setBanner(error.message, "error");
  }
});

el.workerPreferenceForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    await api("/api/worker/preferences", {
      method: "POST",
      body: JSON.stringify({
        visibilityStatus: el.prefVisibility.value,
        shiftPreference: el.prefShiftPreference.value,
        preferredDayWage: Number(el.prefDayWage.value),
        preferredNightWage: Number(el.prefNightWage.value),
        wageFlexibility: el.prefWageFlexibility.value,
        serviceRadiusKm: Number(el.prefServiceRadiusKm.value),
        liveStatus: el.prefLiveStatus.value,
      }),
    });
    setBanner("Worker settings saved.", "success");
    await loadDashboard();
  } catch (error) {
    setBanner(error.message, "error");
  }
});

el.clientOfferForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    await api("/api/wage-offers", {
      method: "POST",
      body: JSON.stringify({
        workerId: el.offerWorkerId.value,
        shiftType: el.offerShiftType.value,
        offeredDayWage: Number(el.offerDayWage.value),
        offeredNightWage: Number(el.offerNightWage.value),
        message: el.offerMessage.value.trim(),
      }),
    });
    el.clientOfferStatus.textContent = "Offer sent to worker. Deal becomes final only after worker accepts.";
    setBanner("Wage offer sent.", "success");
    el.clientOfferForm.reset();
    await loadDashboard();
  } catch (error) {
    setBanner(error.message, "error");
  }
});

el.offerFeed.addEventListener("click", async (event) => {
  const button = event.target.closest(".offer-action");
  if (!button) return;
  try {
    await api("/api/wage-offers/respond", {
      method: "POST",
      body: JSON.stringify({
        offerId: button.dataset.offerId,
        action: button.dataset.action,
      }),
    });
    setBanner(button.dataset.action === "ACCEPT" ? "Offer accepted. Deal is now final." : "Offer declined.", "success");
    await loadDashboard();
  } catch (error) {
    setBanner(error.message, "error");
  }
});

el.notificationFeed.addEventListener("click", async (event) => {
  const button = event.target.closest(".notification-action");
  if (!button) return;
  try {
    await api("/api/notifications/read", {
      method: "POST",
      body: JSON.stringify({
        notificationId: button.dataset.notificationId,
      }),
    });
    setBanner("Notification marked as read.", "success");
    await loadDashboard();
  } catch (error) {
    setBanner(error.message, "error");
  }
});

document.addEventListener("click", async (event) => {
  const resumeButton = event.target.closest(".resume-action");
  if (resumeButton) {
    try {
      const mode = resumeButton.dataset.mode;
      const { blob } = await fetchProtectedFile(`/api/engineers/resume?id=${encodeURIComponent(resumeButton.dataset.id)}&download=${mode === "download" ? "1" : "0"}`);
      const fileUrl = URL.createObjectURL(blob);
      if (mode === "download") {
        const link = document.createElement("a");
        link.href = fileUrl;
        link.download = "resume";
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        window.open(fileUrl, "_blank", "noopener");
      }
      setTimeout(() => URL.revokeObjectURL(fileUrl), 60000);
    } catch (error) {
      setBanner(error.message, "error");
    }
    return;
  }

  const prescreenButton = event.target.closest(".prescreen-action");
  if (prescreenButton) {
    const comments = window.prompt("Enter Skill Quantproc expert comments for pre screening:");
    if (comments === null) return;
    try {
      await api("/api/registry/prescreen", {
        method: "POST",
        body: JSON.stringify({
          id: prescreenButton.dataset.id,
          comments,
        }),
      });
      setBanner("Professional candidate marked as pre screened.", "success");
      await loadDashboard();
    } catch (error) {
      setBanner(error.message, "error");
    }
    return;
  }

  const button = event.target.closest(".registry-action");
  if (!button) return;
  try {
    await api("/api/registry/status", {
      method: "POST",
      body: JSON.stringify({
        type: button.dataset.type,
        id: button.dataset.id,
        status: button.dataset.status,
      }),
    });
    setBanner(`${button.dataset.type} status updated to ${button.dataset.status}.`, "success");
    await loadDashboard();
  } catch (error) {
    setBanner(error.message, "error");
  }
});

el.alertPreferenceForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    await api("/api/alerts/preferences", {
      method: "POST",
      body: JSON.stringify({
        nearbyAlertsEnabled: el.alertNearbyEnabled.value === "true",
      }),
    });
    setBanner("Alert preference saved.", "success");
    await loadDashboard();
  } catch (error) {
    setBanner(error.message, "error");
  }
});

el.mapDots.addEventListener("click", (event) => {
  if (state.map.projectPinMode) {
    return;
  }
  const point = event.target.closest(".map-point");
  if (!point) return;
  state.map.selectedId = point.dataset.pointId;
  renderMap(state.dashboard?.locations || [], state.dashboard?.projectLocations || []);
});

el.mobileMap.addEventListener("click", (event) => {
  if (!state.map.projectPinMode) return;
  const rect = el.mobileMap.getBoundingClientRect();
  const leftPercent = Math.max(10, Math.min(90, ((event.clientX - rect.left) / rect.width) * 100));
  const topPercent = Math.max(12, Math.min(88, ((event.clientY - rect.top) / rect.height) * 100));
  const latLng = pointToLatLng(leftPercent, topPercent);
  state.map.projectDraftPoint = { left: leftPercent, top: topPercent, ...latLng };
  el.projectLatitude.value = String(latLng.latitude);
  el.projectLongitude.value = String(latLng.longitude);
  setProjectPinMode(false);
  renderMap(state.dashboard?.locations || [], state.dashboard?.projectLocations || []);
  setBanner(`Project pin selected at ${latLng.latitude}, ${latLng.longitude}.`, "success");
});

el.mapZoomRange.addEventListener("input", (event) => {
  setMapZoom(Number(event.target.value) / 100);
});

el.mapZoomIn.addEventListener("click", () => {
  setMapZoom(state.map.zoom + 0.2);
});

el.mapZoomOut.addEventListener("click", () => {
  setMapZoom(state.map.zoom - 0.2);
});

el.mapResetButton.addEventListener("click", () => {
  setMapZoom(1);
  if (state.dashboard) {
    state.map.selectedId = null;
    renderMap(state.dashboard.locations || [], state.dashboard.projectLocations || []);
  }
});

el.mapExpandButton.addEventListener("click", () => {
  setMapExpanded(true);
});

el.mapCollapseButton.addEventListener("click", () => {
  setMapExpanded(false);
});

el.projectPinModeButton.addEventListener("click", () => {
  setMapExpanded(true);
  setProjectPinMode(!state.map.projectPinMode);
});

el.projectLocationForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const country = el.projectCountry.value;
  const state = el.projectState.value;
  const district = el.projectDistrict.value;
  const siteName = el.projectSiteName.value.trim();
  const streetAddress = el.projectStreetAddress.value.trim();

  if (!country || !state || !district || !siteName || !streetAddress) {
    setBanner("Please fill country, state, district, site name, and street address.", "error");
    return;
  }

  try {
    await api("/api/project-location", {
      method: "POST",
      body: JSON.stringify({
        country,
        state,
        district,
        siteName,
        streetAddress,
        latitude: el.projectLatitude.value ? Number(el.projectLatitude.value) : null,
        longitude: el.projectLongitude.value ? Number(el.projectLongitude.value) : null,
      }),
    });
    el.projectLocationStatus.textContent = `Project location saved: ${siteName} | ${streetAddress} | ${district}, ${state}, ${country}${el.projectLatitude.value && el.projectLongitude.value ? ` | ${el.projectLatitude.value}, ${el.projectLongitude.value}` : ""}`;
    state.map.projectDraftPoint = null;
    setBanner("Project location saved successfully.", "success");
    await loadDashboard();
  } catch (error) {
    setBanner(error.message, "error");
  }
});

el.projectUseCurrentLocationButton.addEventListener("click", () => {
  if (!navigator.geolocation) {
    setBanner("Geolocation is not supported on this device.", "error");
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (position) => {
      el.projectLatitude.value = String(Number(position.coords.latitude).toFixed(6));
      el.projectLongitude.value = String(Number(position.coords.longitude).toFixed(6));
      state.map.projectDraftPoint = null;
      renderMap(state.dashboard?.locations || [], state.dashboard?.projectLocations || []);
      setBanner("Project coordinates filled from current phone location.", "success");
    },
    (error) => {
      setBanner(error.message, "error");
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  );
});

el.locationButton.addEventListener("click", async () => {
  if (!state.session) {
    setBanner("Login first to share live location.", "error");
    return;
  }
  if (!navigator.geolocation) {
    setBanner("Geolocation is not supported on this device.", "error");
    return;
  }

  el.locationStatus.textContent = "Capturing location...";
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      try {
        await api("/api/location/ping", {
          method: "POST",
          body: JSON.stringify({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          }),
        });
        el.locationStatus.textContent = "Location sent successfully.";
        await loadDashboard();
      } catch (error) {
        setBanner(error.message, "error");
      }
    },
    (error) => {
      el.locationStatus.textContent = error.message;
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  );
});

el.logoutButton.addEventListener("click", () => {
  state.session = null;
  state.dashboard = null;
  renderDashboard();
  setBanner("You have been logged out.", "info");
});

async function init() {
  try {
    await loadBootstrap();
    setMapExpanded(true);
    setMapZoom(1);
    renderRegistrationSection();
    populateEngineerFields();
    renderDashboard();
  } catch (error) {
    setBanner(error.message, "error");
  }
}

init();
