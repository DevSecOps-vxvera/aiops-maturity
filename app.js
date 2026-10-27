"use strict";

const DIMENSIONS = [
  {id:"telemetry", short:"Telemetría", title:"Cobertura de telemetría", desc:"Métricas, logs, trazas, eventos, NetFlow/IPFIX y sincronización temporal.", weight:1.25, evidence:"Inventario de fuentes, cobertura por dominio, retención, pérdida de datos y NTP.", actions:["Inventariar fuentes y brechas de cobertura.","Centralizar métricas, logs, flujos y trazas.","Normalizar identidad, tiempo y etiquetas de servicio.","Automatizar control de calidad y cobertura extremo a extremo."]},
  {id:"data", short:"Datos", title:"Calidad y contexto de datos", desc:"Datos completos, normalizados, oportunos y vinculados con activos y servicios.", weight:1.1, evidence:"Completitud, latencia de ingesta, esquema, identificadores comunes y catálogo.", actions:["Definir campos mínimos y responsables de cada fuente.","Normalizar esquemas y validar completitud.","Crear catálogo de datos operacionales y reglas de calidad.","Medir deriva, sesgo y confiabilidad de datos en producción."]},
  {id:"topology", short:"Topología", title:"Topología y dependencias", desc:"Relación entre red, aplicación, API, nube, base de datos y servicio de negocio.", weight:1.15, evidence:"Mapa actualizado, CMDB, descubrimiento y relación servicio–recurso.", actions:["Documentar dependencias críticas del escenario.","Integrar inventario, CMDB y descubrimiento.","Construir grafo dinámico de servicios y rutas.","Validar automáticamente cambios y dependencias E2E."]},
  {id:"baseline", short:"Detección", title:"Línea base y anomalías", desc:"Capacidad de diferenciar variación normal, degradación y comportamiento anómalo.", weight:1.0, evidence:"Línea base por horario, estacionalidad, precisión, falsos positivos y deriva.", actions:["Definir SLI, SLO y umbrales iniciales.","Incorporar línea base dinámica y anomalías robustas.","Calibrar modelos por contexto y estacionalidad.","Gestionar deriva y reentrenamiento de forma automática."]},
  {id:"correlation", short:"Correlación", title:"Correlación de eventos", desc:"Agrupación temporal y topológica de señales pertenecientes al mismo incidente.", weight:1.2, evidence:"Reglas, ventanas temporales, reducción de alertas y trazabilidad de agrupaciones.", actions:["Definir reglas de deduplicación y ventanas temporales.","Correlacionar alertas con topología y cambios.","Medir reducción de ruido y precisión de agrupación.","Coordinar múltiples dominios y ciclos cerrados."]},
  {id:"rca", short:"Causa raíz", title:"Causa probable y explicación", desc:"Hipótesis sustentada, explicable y contrastable con evidencia operacional.", weight:1.25, evidence:"Hipótesis, evidencias citadas, confianza, pruebas de descarte y resultado real.", actions:["Crear guías manuales de diagnóstico y descarte.","Generar hipótesis correlacionadas con evidencia.","Registrar confianza, explicación y retroalimentación humana.","Aprender de resultados confirmados sin ocultar incertidumbre."]},
  {id:"decision", short:"Decisión", title:"Recomendación operacional", desc:"Priorización de acciones según impacto, riesgo, política y experiencia previa.", weight:1.0, evidence:"Recomendación, impacto esperado, riesgos, responsable y criterio de aprobación.", actions:["Documentar decisiones y responsables por escenario.","Estandarizar recomendaciones y criterios de escalamiento.","Añadir aprobación humana, riesgo y confianza.","Gestionar decisiones por intención y política operacional."]},
  {id:"automation", short:"Automatización", title:"Ejecución y automatización", desc:"Playbooks seguros para aplicar acciones manuales, asistidas o autónomas.", weight:1.3, evidence:"Playbook versionado, alcance, aprobación, permisos mínimos y bitácora.", actions:["Estandarizar procedimientos operativos repetibles.","Convertir tareas frecuentes en playbooks probados.","Orquestar ejecución con aprobación humana y auditoría.","Habilitar acciones autónomas acotadas por política."]},
  {id:"validation", short:"Validación", title:"Validación y reversión", desc:"Comprobación posterior, criterio de éxito, rollback y escalamiento seguro.", weight:1.2, evidence:"Prueba posterior, KPI antes/después, timeout, rollback y resultado de recuperación.", actions:["Definir criterios de éxito y verificación posterior.","Agregar pruebas antes/después a cada playbook.","Automatizar validación, rollback y escalamiento.","Verificar continuamente el cumplimiento del objetivo."]},
  {id:"governance", short:"Gobierno", title:"Gobierno, riesgo y seguridad de IA", desc:"Límites, supervisión humana, privacidad, auditoría, seguridad y responsabilidad.", weight:1.25, evidence:"Políticas, roles, registro de prompts/acciones, datos sensibles y límites operativos.", actions:["Definir propietario, riesgo y datos permitidos.","Establecer revisión humana y registro de recomendaciones.","Aplicar segregación, auditoría y límites de ejecución.","Supervisar riesgo, desempeño y cumplimiento continuamente."]}
];

const LEVELS = [
  {n:0,name:"Operación manual",summary:"La respuesta depende del conocimiento individual y de fuentes aisladas."},
  {n:1,name:"Visibilidad",summary:"Existe observación centralizada y una línea base inicial."},
  {n:2,name:"Inteligencia asistida",summary:"Se detectan anomalías, se correlacionan señales y se propone una causa probable."},
  {n:3,name:"Automatización supervisada",summary:"Las acciones se ejecutan mediante playbooks con aprobación humana y auditoría."},
  {n:4,name:"Autonomía condicionada",summary:"El ciclo cerrado actúa dentro de políticas, valida y revierte si es necesario."},
  {n:5,name:"Autonomía por intención",summary:"La red optimiza resultados extremo a extremo según objetivos y restricciones."}
];

const SCENARIO_CATALOG = [
  {id:"wan-congestion",name:"Congestión WAN o Internet",criticality:"Alta",target:3,description:"Saturación, colas y descarte de paquetes que degradan aplicaciones y experiencia.",objective:"Detectar congestión, identificar el tráfico causante y recomendar QoS, redistribución o ampliación de capacidad.",signals:["SNMP","NetFlow/IPFIX","RTT","Pérdida","Jitter"]},
  {id:"interface-instability",name:"Caída o inestabilidad de interfaz",criticality:"Alta",target:4,description:"Interfaz caída, flapping, errores físicos o pérdida de redundancia.",objective:"Correlacionar la falla con los servicios afectados, aplicar failover y validar la recuperación.",signals:["Syslog","SNMP traps","CRC","Routing","Topología"]},
  {id:"latency-loss-jitter",name:"Latencia, pérdida y jitter elevados",criticality:"Alta",target:3,description:"La conectividad existe, pero el rendimiento y la experiencia se degradan.",objective:"Diferenciar si la causa está en la red, proveedor, servidor o aplicación y reducir el tiempo de diagnóstico.",signals:["RTT","Ping","Jitter","TCP","Tiempo de respuesta"]},
  {id:"wifi-degradation",name:"Degradación de Wi‑Fi",criticality:"Media",target:3,description:"Interferencia, cobertura insuficiente, canal congestionado o punto de acceso saturado.",objective:"Identificar interferencia, mala cobertura, saturación, problemas de roaming o autenticación.",signals:["RSSI","SNR","Canal","Clientes","Retransmisiones"]},
  {id:"api-database",name:"Degradación de API, aplicación o base de datos",criticality:"Alta",target:3,description:"Lentitud o errores originados en una dependencia entre red, API, servicio y base de datos.",objective:"Correlacionar trazas, errores HTTP, RTT y consultas para localizar la dependencia causante.",signals:["OpenTelemetry","HTTP","SQL","Logs","CPU/Memoria"]},
  {id:"capacity-saturation",name:"Saturación de capacidad",criticality:"Media",target:3,description:"Un dispositivo o servicio se aproxima al límite de recursos o sesiones.",objective:"Predecir agotamiento de capacidad y recomendar escalamiento antes de incumplir el SLO.",signals:["CPU","Memoria","Sesiones","Throughput","Disco"]},
  {id:"configuration-change",name:"Incidente por cambio de configuración",criticality:"Alta",target:3,description:"Un cambio en firewall, routing, QoS, SD‑WAN o DNS provoca una degradación.",objective:"Relacionar temporalmente el cambio con el incidente, estimar impacto y recomendar rollback.",signals:["Change log","Syslog","Config diff","Routing","Antes/después"]},
  {id:"critical-network-services",name:"Falla de servicios esenciales de red",criticality:"Alta",target:3,description:"Falla común en DNS, DHCP, VPN, firewall, autenticación o NTP.",objective:"Identificar el servicio compartido que afecta a múltiples usuarios o aplicaciones y restaurarlo con seguridad.",signals:["DNS/DHCP","VPN","Firewall","Autenticación","NTP"]}
];

const HORIZONS = [
  {title:"0—30 días",subtitle:"Fundar y medir"},
  {title:"31—90 días",subtitle:"Integrar y correlacionar"},
  {title:"3—6 meses",subtitle:"Automatizar con supervisión"},
  {title:"6—12 meses",subtitle:"Cerrar el ciclo"}
];

const STORAGE_KEY = "aiops-network-maturity-v3";
const today = new Date().toISOString().slice(0,10);
let selectedScenarioId = null;
let state = loadState() || freshState();

function uid(){return "s_"+Math.random().toString(36).slice(2,10)}
function blankAnswers(){return Object.fromEntries(DIMENSIONS.map(d=>[d.id,null]))}
function freshScenario(name="Escenario personalizado de red"){
  return {id:uid(),templateId:null,name,criticality:"Alta",target:3,objective:"Describa el resultado operacional que desea proteger o mejorar.",answers:blankAnswers()};
}
function scenarioFromTemplate(template){
  return {id:uid(),templateId:template.id,name:template.name,criticality:template.criticality,target:template.target,objective:template.objective,answers:blankAnswers()};
}
function freshState(){const s=scenarioFromTemplate(SCENARIO_CATALOG[0]);selectedScenarioId=s.id;return {version:2,organization:"",assessor:"",date:today,scenarios:[s]}}
function loadState(){try{const parsed=JSON.parse(localStorage.getItem(STORAGE_KEY));if(parsed?.scenarios?.length){selectedScenarioId=parsed.scenarios[0].id;return normalizeState(parsed)}}catch(e){}return null}
function normalizeState(input){
  const out={version:2,organization:String(input.organization||""),assessor:String(input.assessor||""),date:input.date||today,scenarios:[]};
  (input.scenarios||[]).forEach(raw=>{const s=freshScenario();s.id=String(raw.id||uid());s.templateId=SCENARIO_CATALOG.some(t=>t.id===raw.templateId)?raw.templateId:null;s.name=String(raw.name||"Escenario sin nombre");s.criticality=["Alta","Media","Baja"].includes(raw.criticality)?raw.criticality:"Media";s.target=Math.min(5,Math.max(1,Number(raw.target)||3));s.objective=String(raw.objective||"");s.answers=blankAnswers();DIMENSIONS.forEach(d=>{const v=raw.answers?.[d.id];s.answers[d.id]=v===null||v===undefined?null:Math.min(5,Math.max(0,Number(v))) });out.scenarios.push(s)});
  if(!out.scenarios.length)out.scenarios.push(freshScenario());return out;
}
function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}
function active(){return state.scenarios.find(s=>s.id===selectedScenarioId)||state.scenarios[0]}

function calculate(s){
  const answered=DIMENSIONS.filter(d=>Number.isFinite(s.answers[d.id]));
  if(!answered.length)return {complete:false,count:0,index:null,raw:null,level:null,gates:[]};
  const weight=answered.reduce((a,d)=>a+d.weight,0);
  const index=answered.reduce((a,d)=>a+s.answers[d.id]*d.weight,0)/weight;
  let level=Math.floor(index+.12), gates=[];
  const a=s.answers;
  if(answered.length<DIMENSIONS.length)return {complete:false,count:answered.length,index,raw:level,level:null,gates};
  const cap=(max,reason)=>{if(level>max){level=max;gates.push(reason)}};
  if(a.telemetry<1||a.data<1)cap(0,"Sin telemetría y datos confiables no se consolida L1.");
  if(a.telemetry<2||a.baseline<1||a.topology<1)cap(1,"L2 requiere telemetría repetible, línea base y contexto mínimo.");
  if(a.correlation<2||a.rca<2)cap(2,"L3 requiere correlación y causa probable integradas.");
  if(a.decision<3||a.automation<3||a.governance<2)cap(2,"L3 exige recomendación, playbook supervisado y gobierno básico.");
  if(a.automation<4||a.validation<4||a.governance<4)cap(3,"L4 exige ejecución condicionada, validación, rollback y gobierno fuerte.");
  if(DIMENSIONS.some(d=>a[d.id]<5))cap(4,"L5 exige capacidad optimizada en todas las dimensiones.");
  return {complete:true,count:answered.length,index,raw:Math.floor(index+.12),level:Math.max(0,Math.min(5,level)),gates};
}

function esc(s){return String(s).replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]))}
function short(text,max=28){return text.length>max?text.slice(0,max-1)+"…":text}
function toast(msg){const el=document.querySelector("#toast");el.textContent=msg;el.classList.add("show");clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove("show"),2400)}

function renderAll(){renderMeta();renderSidebar();renderEditor();renderResults();save()}
function renderMeta(){
  document.querySelector("#orgName").value=state.organization;
  document.querySelector("#assessor").value=state.assessor;
  document.querySelector("#assessmentDate").value=state.date;
}
function renderSidebar(){
  document.querySelector("#scenarioTotal").textContent=state.scenarios.length;
  const catalogAdded=new Set(state.scenarios.map(s=>s.templateId).filter(Boolean)).size;
  const recommendedButton=document.querySelector("#btnAddRecommended");
  recommendedButton.disabled=catalogAdded===SCENARIO_CATALOG.length;
  recommendedButton.querySelector("strong").textContent=catalogAdded===SCENARIO_CATALOG.length?"Catálogo sugerido agregado":"Catálogo sugerido";
  recommendedButton.querySelector("small").textContent=catalogAdded===SCENARIO_CATALOG.length?"Los 8 escenarios están disponibles":"Agregar los 8 escenarios recomendados";
  const box=document.querySelector("#scenarioList");box.innerHTML=state.scenarios.map(s=>{const r=calculate(s);return `<button class="scenario-tab ${s.id===selectedScenarioId?"active":""}" data-id="${s.id}" type="button"><b>${esc(short(s.name,34))}</b><span>${s.criticality} · ${r.count}/10 <i class="mini-level">${r.level===null?"Pendiente":"L"+r.level}</i></span></button>`}).join("");
  box.querySelectorAll("button").forEach(btn=>btn.onclick=()=>{selectedScenarioId=btn.dataset.id;renderAll()});
}

function addRecommendedScenarios(){
  const onlyScenario=state.scenarios.length===1?state.scenarios[0]:null;
  const isEmptyLegacy=onlyScenario&&!onlyScenario.templateId&&calculate(onlyScenario).count===0;
  if(isEmptyLegacy)state.scenarios=[];
  const existing=new Set(state.scenarios.map(s=>s.templateId).filter(Boolean));
  const added=SCENARIO_CATALOG.filter(item=>!existing.has(item.id)).map(scenarioFromTemplate);
  if(!added.length){toast("Los ocho escenarios ya están agregados");return}
  state.scenarios.push(...added);
  selectedScenarioId=added[0].id;
  renderAll();toast("Ocho escenarios sugeridos disponibles");
}
function renderEditor(){
  const s=active();if(!s)return;
  document.querySelector("#scenarioName").value=s.name;document.querySelector("#scenarioCriticality").value=s.criticality;document.querySelector("#scenarioTarget").value=s.target;document.querySelector("#scenarioObjective").value=s.objective;
  const q=document.querySelector("#questionList");
  q.innerHTML=DIMENSIONS.map((d,i)=>`<article class="question"><div class="question-copy"><span class="question-icon">${String(i+1).padStart(2,"0")}</span><div><h4>${d.title}</h4><p>${d.desc}</p></div></div><div class="level-options" role="group" aria-label="${d.title}">${[0,1,2,3,4,5].map(n=>`<button type="button" class="level-option ${s.answers[d.id]===n?"selected":""}" data-dim="${d.id}" data-value="${n}" title="Nivel ${n}">L${n}</button>`).join("")}</div></article>`).join("");
  q.querySelectorAll(".level-option").forEach(btn=>btn.onclick=()=>{s.answers[btn.dataset.dim]=Number(btn.dataset.value);renderAll()});
  const r=calculate(s),pct=r.count/DIMENSIONS.length*100;document.querySelector("#completionText").textContent=`${r.count} de ${DIMENSIONS.length} dimensiones respondidas`;document.querySelector("#completionBar").style.width=pct+"%";
  document.querySelector("#btnDeleteScenario").style.visibility=state.scenarios.length>1?"visible":"hidden";
}

function completeResults(){return state.scenarios.map(s=>({s,r:calculate(s)})).filter(x=>x.r.complete)}
function getGaps(){
  const gaps=[];state.scenarios.forEach(s=>{const r=calculate(s);if(!r.complete)return;DIMENSIONS.forEach(d=>{const score=s.answers[d.id],gap=Math.max(0,s.target-score);if(gap>0)gaps.push({s,d,score,gap,priority:gap*d.weight*({Alta:1.4,Media:1,Baja:.75}[s.criticality])})})});return gaps.sort((a,b)=>b.priority-a.priority);
}
function renderResults(){
  const complete=completeResults(),allCalcs=state.scenarios.map(s=>calculate(s)),evaluated=complete.length;
  const overall=evaluated?Math.min(...complete.map(x=>x.r.level)):null;
  const avg=evaluated?complete.reduce((a,x)=>a+x.r.index,0)/evaluated:null;
  const gaps=getGaps(),priority=gaps.filter(g=>g.gap>=2||g.priority>=2.4).length;
  document.querySelector("#overallLevel").textContent=overall===null?"—":"L"+overall;
  document.querySelector("#overallLabel").textContent=overall===null?"Sin datos suficientes":LEVELS[overall].name;
  document.querySelector("#overallNote").textContent=overall===null?"Complete las 10 dimensiones de al menos un escenario.":LEVELS[overall].summary;
  document.querySelector("#technicalIndex").textContent=avg===null?"—":avg.toFixed(1);
  document.querySelector("#evaluatedCount").textContent=evaluated;
  document.querySelector("#scenarioCountNote").textContent=`de ${state.scenarios.length} configurado${state.scenarios.length===1?"":"s"}`;
  document.querySelector("#priorityGapCount").textContent=priority;
  document.querySelector("#resultIntro").textContent=evaluated?`${state.organization||"La organización"} presenta ${evaluated} escenario${evaluated===1?"":"s"} con evaluación completa. El nivel consolidado utiliza el escenario completo de menor madurez.`:"Complete las diez dimensiones de al menos un escenario para generar el diagnóstico.";
  renderRadarSelector();renderRadar();renderBars();renderFindings(complete,gaps);renderEvidence(gaps);renderRoadmap(gaps);
}
function renderRadarSelector(){
  const sel=document.querySelector("#radarScenario"),current=sel.value||selectedScenarioId;sel.innerHTML=state.scenarios.map(s=>`<option value="${s.id}">${esc(short(s.name,30))}</option>`).join("");sel.value=state.scenarios.some(s=>s.id===current)?current:state.scenarios[0].id;
}
function renderRadar(){
  const id=document.querySelector("#radarScenario").value,s=state.scenarios.find(x=>x.id===id)||active(),box=document.querySelector("#radarChart"),r=calculate(s);
  if(!r.count){box.innerHTML='<div class="empty-state">Responda dimensiones para mostrar el perfil.</div>';return}
  const W=520,H=390,cx=260,cy=193,R=135,N=DIMENSIONS.length;
  const point=(i,val)=>{const a=-Math.PI/2+i*2*Math.PI/N;return [cx+Math.cos(a)*R*(val/5),cy+Math.sin(a)*R*(val/5)]};
  let grid="";for(let lv=1;lv<=5;lv++){grid+=`<polygon points="${DIMENSIONS.map((_,i)=>point(i,lv).join(",")).join(" ")}" fill="none" stroke="#29465c" stroke-width="${lv===5?1.2:.7}"/>`}
  const axes=DIMENSIONS.map((d,i)=>{const p=point(i,5),l=point(i,6.05);return `<line x1="${cx}" y1="${cy}" x2="${p[0]}" y2="${p[1]}" stroke="#203d53"/><text x="${l[0]}" y="${l[1]}" fill="#8da4b7" font-size="10" text-anchor="middle" dominant-baseline="middle">${d.short}</text>`}).join("");
  const vals=DIMENSIONS.map((d,i)=>point(i,s.answers[d.id]??0));const polygon=vals.map(p=>p.join(",")).join(" ");const dots=vals.map(p=>`<circle cx="${p[0]}" cy="${p[1]}" r="3.4" fill="#25d4e8"/>`).join("");
  box.innerHTML=`<svg viewBox="0 0 ${W} ${H}" aria-hidden="true">${grid}${axes}<polygon points="${polygon}" fill="rgba(37,212,232,.18)" stroke="#25d4e8" stroke-width="2.2"/>${dots}<text x="${cx}" y="${cy-5}" text-anchor="middle" fill="#eaf3ff" font-size="22" font-weight="900">${r.level===null?"—":"L"+r.level}</text><text x="${cx}" y="${cy+14}" text-anchor="middle" fill="#6f8ca3" font-size="9">Índice ${r.index.toFixed(1)}</text></svg>`;
}
function renderBars(){
  const box=document.querySelector("#scenarioBars");box.innerHTML=state.scenarios.map(s=>{const r=calculate(s),value=r.level??0;return `<div class="bar-row"><span title="${esc(s.name)}">${esc(s.name)}</span><div class="bar-track"><div class="bar-fill" style="width:${value/5*100}%"></div><i class="target-marker" style="left:${s.target/5*100}%" title="Objetivo L${s.target}"></i></div><b>${r.level===null?"—":"L"+r.level}</b></div>`}).join("");
}
function renderFindings(complete,gaps){
  const box=document.querySelector("#findingsList");if(!complete.length){box.innerHTML='<div class="empty-state">Los hallazgos aparecerán al completar un escenario.</div>';return}
  const items=[];complete.forEach(({s,r})=>{items.push({t:`${s.name}: L${r.level}`,p:`Índice técnico ${r.index.toFixed(1)}. Objetivo L${s.target}. ${r.gates[0]||LEVELS[r.level].summary}`})});
  if(gaps.length){const g=gaps[0];items.push({t:`Mayor brecha: ${g.d.title}`,p:`${g.s.name} registra L${g.score} frente a objetivo L${g.s.target}.`})}
  box.innerHTML=items.slice(0,5).map((x,i)=>`<div class="finding"><i>${i+1}</i><div><b>${esc(x.t)}</b><p>${esc(x.p)}</p></div></div>`).join("");
}
function renderEvidence(gaps){
  const box=document.querySelector("#evidenceList"),seen=new Set(),items=[];for(const g of gaps){if(!seen.has(g.d.id)){seen.add(g.d.id);items.push(g);if(items.length===5)break}}
  if(!items.length){box.innerHTML='<div class="empty-state">No hay brechas calculadas o la evaluación está pendiente.</div>';return}
  box.innerHTML=items.map(g=>`<div class="evidence-item"><b>${g.d.title}</b><p>${g.d.evidence}</p></div>`).join("");
}
function renderRoadmap(gaps){
  const box=document.querySelector("#roadmap");if(!gaps.length){box.innerHTML='<div class="empty-state">Complete la evaluación y defina un objetivo superior al estado actual.</div>';return}
  const cols=HORIZONS.map(()=>[]),used=new Set();
  gaps.forEach(g=>{
    const key=g.s.id+g.d.id;if(used.has(key))return;used.add(key);
    let h=g.score<=1?0:g.score===2?1:g.score===3?2:3;if(cols[h].length>=4)h=Math.min(3,h+1);
    const actionIndex=Math.min(3,Math.max(0,g.score));cols[h].push({title:g.d.actions[actionIndex],meta:`${short(g.s.name,24)} · ${g.d.short} L${g.score}→L${Math.min(g.s.target,g.score+1)}`,high:g.gap>=2});
  });
  box.innerHTML=HORIZONS.map((h,i)=>`<div class="roadmap-column"><h4>${h.title}</h4><p>${h.subtitle}</p>${cols[i].length?cols[i].map(x=>`<div class="roadmap-item ${x.high?"priority-high":""}"><b>${esc(x.title)}</b><span>${esc(x.meta)}</span></div>`).join(""):'<div class="roadmap-item"><b>Consolidar avances</b><span>Validar evidencia y KPI antes de escalar.</span></div>'}</div>`).join("");
}

function bind(){
  ["orgName","assessor","assessmentDate"].forEach(id=>document.querySelector("#"+id).addEventListener("input",e=>{const key={orgName:"organization",assessor:"assessor",assessmentDate:"date"}[id];state[key]=e.target.value;renderResults();save()}));
  [["scenarioName","name"],["scenarioCriticality","criticality"],["scenarioTarget","target"],["scenarioObjective","objective"]].forEach(([id,key])=>document.querySelector("#"+id).addEventListener("input",e=>{active()[key]=key==="target"?Number(e.target.value):e.target.value;renderSidebar();renderResults();save()}));
  document.querySelector("#radarScenario").addEventListener("change",renderRadar);
  document.querySelector("#btnAddScenario").onclick=()=>{const s=freshScenario("Nuevo escenario de red");state.scenarios.push(s);selectedScenarioId=s.id;renderAll();toast("Escenario agregado")};
  document.querySelector("#btnAddRecommended").onclick=addRecommendedScenarios;
  document.querySelector("#btnDeleteScenario").onclick=()=>{if(state.scenarios.length<2)return;if(!confirm("¿Eliminar este escenario y sus respuestas?"))return;state.scenarios=state.scenarios.filter(s=>s.id!==selectedScenarioId);selectedScenarioId=state.scenarios[0].id;renderAll();toast("Escenario eliminado")};
  document.querySelector("#btnReset").onclick=()=>{if(!confirm("¿Reiniciar toda la evaluación?"))return;state=freshState();renderAll();toast("Evaluación reiniciada")};
  document.querySelector("#btnPrint").onclick=()=>window.print();
  document.querySelector("#btnExport").onclick=exportJSON;
  document.querySelector("#fileImport").addEventListener("change",importJSON);
  document.querySelector("#btnDemo").onclick=loadDemo;
}
function exportJSON(){
  const payload={...state,exportedAt:new Date().toISOString(),methodology:"Adaptación educativa TM Forum AN Levels + ETSI ZSM + NIST AI RMF"};const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`evaluacion-aiops-${(state.organization||"redes").toLowerCase().replace(/[^a-z0-9]+/g,"-")}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);toast("Evaluación exportada")
}
function importJSON(e){const file=e.target.files[0];if(!file)return;const reader=new FileReader();reader.onload=()=>{try{state=normalizeState(JSON.parse(reader.result));selectedScenarioId=state.scenarios[0].id;renderAll();toast("Evaluación importada")}catch(err){alert("El archivo no contiene una evaluación válida.")}};reader.readAsText(file);e.target.value=""}
function loadDemo(){
  const make=(name,crit,target,obj,vals)=>{const s=freshScenario(name);s.criticality=crit;s.target=target;s.objective=obj;DIMENSIONS.forEach((d,i)=>s.answers[d.id]=vals[i]);return s};
  state={version:2,organization:"Laboratorio de Observabilidad de Redes",assessor:"Equipo de Operaciones",date:today,scenarios:[
    make("Congestión de red y API lenta","Alta",3,"Correlacionar RTT, errores HTTP y dependencia de base de datos.",[3,3,3,3,3,3,2,1,1,2]),
    make("Degradación Wi‑Fi en hora pico","Media",3,"Reducir tiempo de detección y aislar interferencia o saturación.",[2,2,2,2,1,1,1,0,0,1]),
    make("Caída de interfaz WAN crítica","Alta",4,"Detectar, conmutar y validar recuperación dentro del SLO.",[4,3,4,3,3,3,3,3,2,3])
  ]};selectedScenarioId=state.scenarios[0].id;renderAll();document.querySelector("#resultados").scrollIntoView({behavior:"smooth"});toast("Ejemplo cargado")
}

bind();renderAll();
