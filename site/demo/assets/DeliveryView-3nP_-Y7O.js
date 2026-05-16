import{r as f,j as e,s as l,f as u,c as t,a as R,L as Ee}from"./index-BpfLpNdB.js";import{a as We}from"./useMediaQuery-B901lqet.js";import{g as Fe,s as $e}from"./coworkStore-E0DXBLZd.js";import{u as He}from"./useAgentProfiles-Dm005jp1.js";import{u as Me}from"./useVoiceInput-B84lIaSI.js";import"./demoProfiles-B_JtkQW5.js";function ze(o){const s=o.trimStart().substring(0,500);return!!([/^I'll /i,/^I will /i,/^Let me /i,/^I need to/i,/^I see /i,/^I can see/i,/^I have /i,/^I've /i,/^First,/i,/^Now,/i,/^Now let/i,/^Next,/i,/^OK[,.\s]/i,/^Okay/i,/^Sure/i,/^Certainly/i,/^Good\./i,/^Good —/i,/^Great/i,/^Excellent/i,/^Perfect/i,/^Here is/i,/^Here's /i,/^Based on/i,/^The analysis/i,/^Below is/i,/^What follows/i,/^The following/i,/^Clean slate/i,/^The specialist/i,/^Both specialists/i,/^Let me check/i,/^I'll start/i,/^I'll now/i,/^I'll get started/i,/^Looking at/i,/^After review/i,/^Once analyzed/i,/^The process/i,/^In summary,? here/i,/^To begin/i,/^Starting with/i,/^Moving on/i].some(r=>r.test(s))||[/get_current_step/i,/advance_step/i,/post_finding/i,/dispatching the/i,/running in parallel/i,/permission issue/i,/tool.*has.*issue/i,/subagent/i,/debate board/i].some(r=>r.test(s)))}function Ne(o){const s=o.split(/\n\n+/).filter(r=>{const n=r.trim();return n.length>30&&!n.startsWith("#")&&n!=="---"});if(s.length===0)return 0;const i=[/^I'll /im,/^I will /im,/^Let me /im,/^I need to/im,/^I can see/im,/^I have /im,/^I've /im,/^I see /im,/^Now let/im,/^OK[,.\s]/im,/^Okay/im,/^Sure/im,/^Certainly/im,/^Good\./im,/^Good —/im,/^Great/im,/^Excellent/im,/^Perfect/im,/^Here is/im,/^Here's /im,/^Based on my/im,/^Looking at/im,/^After review/im,/^To begin/im,/^Starting with/im,/^Moving on/im,/^I'll get started/im];let a=0;for(const r of s)i.some(n=>n.test(r.trim()))&&a++;return a/s.length}function Ue(o){const s=[/\[To be (filled|completed|added|determined)[^\]]*\]/gi,/\[PLACEHOLDER[^\]]*\]/gi,/\[TBD[^\]]*\]/gi,/\[TODO[^\]]*\]/gi,/\[PENDING[^\]]*\]/gi,/\[DRAFT[^\]]*\]/gi,/\[SECTION [^\]]*\]/gi,/\[Analysis goes here[^\]]*\]/gi,/\[Content here[^\]]*\]/gi,/\[Add (content|analysis|text)[^\]]*\]/gi];let i=0;for(const r of s){const n=o.match(r);n&&(i+=n.length)}const a=o.match(/\[[A-Z][A-Z\s]{2,30}\]/g);return a&&a.length>=3&&(i+=a.length),i}function Oe(o){const s=o.split(/^(?=#{1,6}\s)/m).filter(r=>r.trim());if(s.length===0)return{sectionsWithContent:0,totalSections:0,avgCharsPerSection:0};let i=0,a=0;for(const r of s){const c=r.split(`
`).filter(m=>{const d=m.trim();return d&&!d.startsWith("#")&&d!=="---"&&d!=="***"}).join(" ").trim().length;i+=c,c>=150&&a++}return{sectionsWithContent:a,totalSections:s.length,avgCharsPerSection:s.length>0?Math.round(i/s.length):0}}function Ge(o){const s=o.split(`
`);let i=0;for(let a=0;a<s.length;a++){const n=s[a].trim().match(/^(#{1,6})\s/);if(!n)continue;const c=n[1].length;let m=!1;for(let d=a+1;d<s.length;d++){const p=s[d].trim();if(!p||p==="---"||p==="***")continue;const h=p.match(/^(#{1,6})\s/);if(h){h[1].length>c&&(m=!0);break}m=!0;break}m||i++}return i}function qe(o){if(!o)return{valid:!1,reason:"empty"};const s=o.trim();if(s.length<500)return{valid:!1,reason:"too_short"};if(!s.startsWith("#"))return{valid:!1,reason:"no_heading"};if(ze(o))return{valid:!1,reason:"process_text"};if((s.match(/^#{1,6}\s/gm)||[]).length<3)return{valid:!1,reason:"no_structure"};const a=Oe(s);return a.sectionsWithContent<2||a.avgCharsPerSection<100?{valid:!1,reason:"thin_content"}:Ge(s)>2?{valid:!1,reason:"empty_sections"}:Ue(s)>=5?{valid:!1,reason:"excessive_placeholders"}:Ne(s)>.05?{valid:!1,reason:"process_contamination"}:{valid:!0}}const Ye=3e3,Ve=1e4,Ae=300*1e3,_e=6e4;function Ke(){const[o,s]=f.useState(null),[i,a]=f.useState(!0),[r,n]=f.useState(null),[c,m]=f.useState("polling"),d=f.useRef(!1),p=f.useRef(void 0),h=f.useRef(Date.now()),C=f.useRef(!1),w=f.useCallback(async(g,T)=>{if(!d.current)try{const j=await fetch(`/api/sessions/${g}`,{credentials:"include"});if(j.status===404){const A=await fetch(`/api/sessions/archive/${g}`,{credentials:"include"});if(A.ok){const v=await A.json();if(d.current)return;s(Xe(g,v)),a(!1),m("ready");return}throw new Error("Session not found")}if(!j.ok)throw new Error("Failed to fetch session");const P=await j.json();if(d.current)return;const L=Je(g,P);s(L),a(!1);const y=qe(L.finalOutput).valid,k=L.status==="Complete"&&!y,b=Date.now()-T;if(y?m("ready"):L.status==="Complete"&&b>=Ae?m("timeout"):L.status==="Complete"&&m("polling"),y)C.current||(C.current=!0,p.current=setTimeout(()=>w(g,T),_e));else if(L.status!=="Complete"||k){const A=b>=Ae?Ve:Ye;p.current=setTimeout(()=>w(g,T),A)}}catch(j){if(d.current)return;n(j instanceof Error?j.message:"Unknown error"),a(!1)}},[]),I=f.useCallback(async()=>{const g=sessionStorage.getItem("shem-session-id");if(g){p.current&&(clearTimeout(p.current),p.current=void 0),C.current=!1,m("polling");try{const T=await fetch(`/api/sessions/${g}`,{credentials:"include"});if(d.current)return;if(T.ok){const P=await T.json();if(P.assembledDocument&&P.assembledDocument.length>100){h.current=Date.now(),w(g,h.current);return}}const j=await fetch(`/api/sessions/${g}/reassemble`,{method:"POST",credentials:"include"});if(d.current)return;if(!j.ok){const P=await j.json().catch(()=>({error:"Unknown error"}));console.error("[Retry] Reassembly failed:",P),m("error");return}h.current=Date.now(),w(g,h.current)}catch{if(d.current)return;console.error("[Retry] Could not reach server"),m("error")}}},[w]);return f.useEffect(()=>{d.current=!1;const g=sessionStorage.getItem("shem-session-id");if(!g){s(ke("demo-session-preview")),a(!1),m("ready");return}if(g.startsWith("demo-session-")){s(ke(g)),a(!1),m("ready");return}return h.current=Date.now(),w(g,h.current),()=>{d.current=!0,p.current&&(clearTimeout(p.current),p.current=void 0)}},[w]),{data:o,loading:i,error:r,assemblyStatus:c,retryAssembly:I}}function ae(o){return o.replace(/-/g," ").replace(/\b\w/g,s=>s.toUpperCase())}function Je(o,s){var Ce,Te;const i=s.workflow,a=s.debate,r=s.verification,n=s.cost,c=s.evaluator,m=s.agentPerformance,d=s.matterTitle,p=s.durationMs,C=s.assembledDocument||null,w=s.debateResolutions,I=s.gateDecisionRecords,g=s.findings,T=s.beforeScores,j=s.afterScores,P=s.reportCard,L=(c==null?void 0:c.bestScore)??0,y=(c==null?void 0:c.results)??[],k=y.filter(x=>x.passed).length,b=y.filter(x=>!x.passed).length,A=(i==null?void 0:i.currentStep)==="delivered",v=((i==null?void 0:i.currentStep)??"unknown").replace(/_/g," "),S=d??"Session Results",F=[];if(A?F.push("Analysis complete."):F.push(`Session in progress — currently at: ${v}.`),k>0&&F.push(`${k} quality gate${k>1?"s":""} passed.`),((a==null?void 0:a.findingsCount)??0)>0&&F.push(`${a==null?void 0:a.findingsCount} findings, ${(a==null?void 0:a.challengesCount)??0} challenges.`),((n==null?void 0:n.accumulated)??0)>0&&F.push(`Cost: $${((n==null?void 0:n.accumulated)??0).toFixed(2)} of $${((n==null?void 0:n.budget)??0).toFixed(2)} budget.`),p&&p>0){const x=Math.round(p/6e4);F.push(`Duration: ${x>0?`${x} min`:"<1 min"}.`)}const E=[];if((Te=(Ce=P==null?void 0:P.scores)==null?void 0:Ce.deltas)!=null&&Te.length)for(const x of P.scores.deltas)E.push({dimension:x.dimension,before:x.before,after:x.after,delta:x.delta});else if(T!=null&&T.length&&(j!=null&&j.length))for(const x of T){const J=j.find(ne=>ne.dimension===x.dimension);E.push({dimension:x.dimension,before:x.score,after:(J==null?void 0:J.score)??x.score,delta:((J==null?void 0:J.score)??x.score)-x.score})}const $=(g??[]).filter(x=>x.severity==="RED"||x.severity==="YELLOW").slice(0,8).map(x=>{const J=(x.evidence??[]).join("; "),ne=J.length>0;return{title:`${x.severity==="RED"?"⛔":"⚠️"} ${x.category.replace(/[-_]/g," ").replace(/\b\w/g,le=>le.toUpperCase())}`,before:ne?J:x.content,after:ne?x.content:`Flagged by ${ae(x.agent)}`}}),K=[],Y=g??[];if(Y.length>0){const x=[...new Set(Y.map(ce=>ce.agent))],J=Y.filter(ce=>ce.severity==="RED").length,ne=Y.filter(ce=>ce.severity==="YELLOW").length;let le=`The analysis phase produced ${Y.length} finding${Y.length>1?"s":""} across ${x.length} specialist${x.length>1?"s":""}.`;J>0&&(le+=` ${J} critical (RED) finding${J>1?"s were":" was"} flagged for immediate attention.`),ne>0&&(le+=` ${ne} important (YELLOW) finding${ne>1?"s were":" was"} identified.`),K.push({phase:"Analysis",heading:`${Y.length} findings from ${x.length} specialist${x.length>1?"s":""}`,body:le,agents:x.map(ae)})}for(const x of w??[])K.push({phase:"Debate",heading:x.topic,body:x.resolution,agents:[],highlight:x.escalationNeeded?"This resolution was flagged for escalation.":void 0});for(const x of I??[])K.push({phase:"Review Gate",heading:`${x.gateType.replace(/_/g," ")} gate: ${x.decision}`,body:x.notes??`The ${x.gateType.replace(/_/g," ")} gate was ${x.decision}.`,agents:[]});for(const x of y)K.push({phase:x.step.replace(/_/g," "),heading:x.passed?"Quality gate passed":"Quality gate failed",body:x.passed?`The evaluator approved the ${x.step.replace(/_/g," ")} step output.`:`Issues found: ${(x.failureReasons??[]).join("; ")||"unspecified"}.`,agents:[]});A&&K.push({phase:"Delivery",heading:"Work product delivered",body:"All workflow steps completed. The deliverable has been assembled and is ready for review.",agents:[]});const X=(m??[]).map(x=>({name:ae(x.role),role:x.role,findingsPosted:x.findingsPosted??0,challengesSurvived:0,avgConfidence:L})),Z=(w??[]).map(x=>({topic:x.topic,resolution:x.resolution,winningPosition:x.winningPosition,evidenceWeight:x.evidenceWeight,escalationNeeded:x.escalationNeeded,confidence:x.confidence})),oe=(I??[]).map(x=>({gateType:x.gateType.replace(/_/g," "),decision:x.decision,summary:x.notes})),V=[];((r==null?void 0:r.resultsCount)??0)>0&&V.push({type:"self",passed:((r==null?void 0:r.failed)??0)===0,label:"Self-Check"},{type:"cross",passed:((r==null?void 0:r.failed)??0)===0,label:"Cross-Check"});for(const x of y)V.push({type:"evaluator",passed:x.passed,label:`${x.step.replace(/_/g," ")} evaluator`,score:x.score});const ie=[];A?(ie.push({label:"Review the output",description:"Read through the generated content carefully. Compare against your original brief to verify all requirements were addressed.",kind:"action"}),ie.push({label:"Independent counsel review",description:"For legally binding documents, have an independent attorney review the output before finalizing.",kind:"watchout"})):ie.push({label:"Session still in progress",description:`The session is at the "${v}" step. Return to the Working View to monitor progress.`,kind:"action"});const pe=[];return Z.some(x=>x.escalationNeeded)&&pe.push("One or more debate resolutions were flagged for escalation"),Y.some(x=>x.severity==="RED")&&pe.push("RED severity findings were identified — verify remediation"),pe.push("Verify legal accuracy with qualified counsel before relying on this output"),{sessionId:o,status:A?"Complete":v,documentTitle:S,executiveSummary:F.join(" "),keyChanges:$,dimensions:E,finalOutput:C??"",debateResolutions:Z,gateDecisions:oe,verificationChecks:V,narrative:K,debate:{findingsCount:(a==null?void 0:a.findingsCount)??0,challengesCount:(a==null?void 0:a.challengesCount)??0,resolutionsCount:(a==null?void 0:a.resolutionsCount)??0,unresolvedCount:(a==null?void 0:a.unresolvedCount)??0},verification:{resultsCount:((r==null?void 0:r.resultsCount)??0)+y.length,passed:((r==null?void 0:r.passed)??0)+k,failed:((r==null?void 0:r.failed)??0)+b,confidence:L},cost:{accumulated:(n==null?void 0:n.accumulated)??0,budget:(n==null?void 0:n.budget)??0,remaining:(n==null?void 0:n.remaining)??0},agentPerformance:X,eventCount:s.eventCount??0,confidenceSummary:s.confidenceSummary??void 0,limitations:{flaggedForHumanReview:pe,confidenceIntervals:"",disclaimer:"This analysis was produced by an AI system with multi-agent verification. For matters involving regulatory filings, litigation, or binding contractual obligations, we recommend independent counsel verification."},nextSteps:ie}}function Xe(o,s){const i=s.title||"Archived Session",a=s.assembledDocument||"",r=s.costUsd||0,n=s.budgetUsd||0,c=s.durationMs||0,m=s.findingsCount||0,d=s.resolutionsCount||0,p=s.teamRoles||[];s.completedAt;const h=s.summary||{},C=h.debate||{},w=h.topFindings||[],I=h.resolutions||[],g=h.beforeScores||[],T=h.afterScores||[],j=h.verification||{},P=c>0?Math.round(c/6e4):0,L=["Analysis complete.",m>0?`${m} findings, ${d} resolutions.`:"",r>0?`Cost: $${r.toFixed(2)} of $${n.toFixed(2)} budget.`:"",P>0?`Duration: ${P} min.`:""].filter(Boolean),y=g.map(E=>{const $=T.find(K=>K.dimension===E.dimension);return{dimension:E.dimension,before:E.score,after:($==null?void 0:$.score)??E.score,delta:(($==null?void 0:$.score)??E.score)-E.score}}),k=w.filter(E=>E.severity==="RED"||E.severity==="YELLOW").slice(0,8).map(E=>({title:`${E.severity==="RED"?"⛔":"⚠️"} ${E.agent?ae(E.agent):"Finding"}`,before:E.content,after:`Flagged by ${E.agent?ae(E.agent):"specialist"}`})),b=I.map(E=>({topic:E.topic,resolution:E.resolution,winningPosition:"",evidenceWeight:"",escalationNeeded:!1})),A=[];if(w.length>0){const E=[...new Set(w.map($=>$.agent).filter(Boolean))];A.push({phase:"Analysis",heading:`${m} findings from ${E.length||1} specialist${E.length!==1?"s":""}`,body:`The analysis produced ${m} findings. ${w.filter($=>$.severity==="RED").length} critical issues were identified.`,agents:E.map(ae)})}for(const E of I)A.push({phase:"Debate",heading:E.topic,body:E.resolution,agents:[]});A.push({phase:"Delivery",heading:"Work product delivered",body:"All workflow steps completed. The deliverable was assembled and delivered.",agents:[]});const v=p.map(E=>({name:ae(E),role:E,findingsPosted:0,challengesSurvived:0,avgConfidence:0})),S=j.total??0,F=j.passed??0;return{sessionId:o,status:"Complete",documentTitle:i,executiveSummary:L.join(" "),keyChanges:k,dimensions:y,finalOutput:a,debateResolutions:b,gateDecisions:[],verificationChecks:S>0?[{type:"verification",passed:F===S,label:`${F}/${S} checks passed`}]:[],narrative:A,debate:{findingsCount:C.findingsCount??m,challengesCount:C.challengesCount??0,resolutionsCount:C.resolutionsCount??d,unresolvedCount:0},verification:{resultsCount:S,passed:F,failed:S-F,confidence:0},cost:{accumulated:r,budget:n,remaining:n-r},agentPerformance:v,eventCount:0,limitations:{flaggedForHumanReview:["Verify legal accuracy with qualified counsel before relying on this output"],confidenceIntervals:"",disclaimer:"This analysis was produced by an AI system with multi-agent verification."},nextSteps:[{label:"Review the output",description:"Read through the generated content carefully.",kind:"action"},{label:"Independent counsel review",description:"For legally binding documents, have an independent attorney review.",kind:"watchout"}]}}function ke(o){if(o.includes("heartconnect"))return Qe(o);if(o.includes("medivault")||o.includes("healthprivacy"))return et(o);if(o.includes("cloudmsa"))return it(o);if(o.includes("devcontract"))return ot(o);let s="Terms of Service Redesign";try{const i=sessionStorage.getItem("shem-matter-data");if(i){const a=JSON.parse(i);a.matterTitle&&(s=a.matterTitle)}}catch{}return{sessionId:o,status:"Complete",documentTitle:s,executiveSummary:"Your document has been redesigned for clarity, accessibility, and legal precision. Reading level was reduced from Grade 14.2 to Grade 7.8, making it accessible to 94% of the adult population. Visual hierarchy was restructured with consistent heading levels, and all WCAG 2.1 AA compliance gaps were resolved. Legal meaning was independently verified as fully preserved throughout the transformation.",keyChanges:[{title:"Readability",before:"Flesch-Kincaid Grade 14.2 — university-level language requiring specialized knowledge",after:"Grade 7.8 — clear, accessible language that maintains professional tone"},{title:"Visual Hierarchy",before:"Inconsistent heading structure, no clear information flow",after:"Three-level heading system with consistent styling and logical document flow"},{title:"Accessibility",before:"Color contrast ratios below WCAG 2.1 AA thresholds in 3 sections",after:"Full WCAG 2.1 AA compliance — all contrast ratios above 4.5:1"},{title:"Legal Meaning",before:"Original legal intent embedded in complex sentence structures",after:"Identical legal meaning verified — no semantic drift detected across 12 checkpoint tests"}],dimensions:[{dimension:"Readability",before:1.8,after:3.8,delta:2},{dimension:"Findability",before:2.1,after:3.4,delta:1.3},{dimension:"Clarity",before:2.3,after:3.9,delta:1.6},{dimension:"Visual Design",before:2.5,after:4.1,delta:1.6},{dimension:"Ethics",before:2,after:3.2,delta:1.2}],finalOutput:`# Terms of Service — Redesigned

## TL;DR

This agreement covers your use of our platform. You keep your data. We keep our platform running. If something goes wrong, our liability is limited to what you paid us. You can leave anytime.

## Key Terms

| Term | Meaning |
|------|--------|
| **Service** | The platform and all features you access through your account |
| **Content** | Anything you upload, create, or store on the platform |
| **Subscription Period** | The billing cycle you selected (monthly or annual) |

## Your Rights

- You own everything you create on the platform
- You can export your data at any time
- You can cancel your subscription at any time
- We will not sell your personal data to third parties

## Your Obligations

- Use the platform lawfully
- Keep your login credentials secure
- Do not attempt to reverse-engineer the platform
- Respect other users' content and privacy

## Liability

Our total liability is limited to the fees you paid in the 12 months before the claim arose. We are not liable for indirect or consequential damages. This limitation does not apply to our indemnification obligations or breaches of confidentiality.

## Termination

Either party may terminate this agreement with 30 days written notice. Upon termination, you have 60 days to export your data before it is deleted.
`,debateResolutions:[{topic:"Visual hierarchy severity",resolution:"Upgraded to RED — structural issue affects both comprehension and programmatic accessibility.",winningPosition:"Ethics auditor's accessibility argument prevailed — heading hierarchy is a Level A WCAG failure, not merely cosmetic.",evidenceWeight:"WCAG 2.1 SC 1.3.1 requirement is dispositive. Screen reader navigation testing confirmed complete failure.",escalationNeeded:!1,confidence:.92},{topic:"Transformation quality",resolution:"All verification checks passed. Document meets readability, accessibility, and accuracy targets.",winningPosition:"Transformation specialist's restructuring and plain language rewrite both validated by cross-verification.",evidenceWeight:"Three independent verification checks (readability, accessibility, legal-accuracy) all passed.",escalationNeeded:!1,confidence:.88}],gateDecisions:[{gateType:"ethics critical",decision:"approve",summary:"Three RED findings related to WCAG 2.1 AA compliance, readability, and heading structure. Approved to proceed with remediation."},{gateType:"final delivery",decision:"approve",summary:"All checks passed. Document meets all targets."}],verificationChecks:[{type:"readability",passed:!0,label:"Readability",score:.93},{type:"accessibility",passed:!0,label:"Accessibility",score:.78},{type:"legal-accuracy",passed:!0,label:"Legal Accuracy",score:.91}],narrative:[{phase:"Analysis",heading:"Three perspectives, three problems",body:"The engagement began with three specialists examining the document simultaneously. The Design Reviewer identified inconsistent heading structures that disrupted the reading flow. The Plain Language Specialist measured readability at Grade 14.2 — well above the target of Grade 8. Meanwhile, the Ethics Auditor flagged color contrast ratios that fell short of WCAG 2.1 AA standards, meaning the document was inaccessible to readers with visual impairments.",agents:["Design Reviewer","Plain Language Specialist","Ethics Auditor"]},{phase:"First Review",heading:"A challenge that changed the outcome",body:"During the first review round, the Ethics Auditor challenged the Design Reviewer's severity assessment of the heading structure issue. The original classification was YELLOW — important but not critical. The challenge argued that inconsistent headings don't just affect aesthetics; they affect comprehension for screen reader users, making this an accessibility issue at its core. The Design Reviewer accepted the challenge, and the finding was upgraded to RED.",agents:["Ethics Auditor","Design Reviewer"],highlight:"This challenge elevated a visual issue to a structural accessibility concern — a distinction that changed the transformation approach."},{phase:"Ethics Check",heading:"Flagged for human review",body:"Two RED findings related to accessibility triggered the ethics gate. The system flagged that these issues affect users with disabilities and readers with lower literacy levels. After review, the decision was to proceed with remediation — the transformation would need to address both readability and accessibility comprehensively, not as separate fixes.",agents:[],highlight:"The ethics gate ensured accessibility wasn't treated as cosmetic but as a fundamental requirement."},{phase:"Transformation",heading:"Rewriting with precision",body:"The Transformation Specialist restructured the entire document with a new three-level heading system. The Plain Language Specialist then rewrote the content to Grade 8 reading level, working sentence by sentence to simplify language without altering legal obligations. This was the most time-intensive phase — every simplification had to preserve exact legal meaning.",agents:["Transformation Specialist","Plain Language Specialist"]},{phase:"Verification",heading:"All checks passed",body:"Three independent verification checks confirmed the transformation met all targets. Readability scored Grade 7.8. Accessibility achieved full WCAG 2.1 AA compliance. Most critically, the legal accuracy verification confirmed that no semantic drift had occurred — every legal obligation, right, and condition in the original document was preserved in the new version.",agents:[]},{phase:"Final Approval",heading:"Ready for delivery",body:"The Meaning Guardian performed a final independent review, running 12 checkpoint tests comparing original and transformed versions. The verdict: legal meaning fully preserved, no semantic drift detected. The document was approved for delivery.",agents:["Meaning Guardian"]}],debate:{findingsCount:5,challengesCount:1,resolutionsCount:2,unresolvedCount:0},verification:{resultsCount:3,passed:3,failed:0,confidence:.91,breakdown:[{type:"self",passed:!0,confidence:.93,label:"Self-Check"},{type:"cross",passed:!0,confidence:.87,label:"Cross-Check"},{type:"score",passed:!0,confidence:.94,label:"Score-Check"}]},cost:{accumulated:4.58,budget:10,remaining:5.42},agentPerformance:[{name:"Design Reviewer",role:"design-reviewer",findingsPosted:2,challengesSurvived:0,avgConfidence:.87},{name:"Ethics Auditor",role:"ethics-auditor",findingsPosted:1,challengesSurvived:1,avgConfidence:.91},{name:"Plain Language Specialist",role:"plain-language-specialist",findingsPosted:1,challengesSurvived:0,avgConfidence:.93},{name:"Transformation Specialist",role:"transformation-specialist",findingsPosted:1,challengesSurvived:0,avgConfidence:.95},{name:"Meaning Guardian",role:"meaning-guardian",findingsPosted:1,challengesSurvived:0,avgConfidence:.96},{name:"Synthesis Editor",role:"synthesis-editor",findingsPosted:0,challengesSurvived:0,avgConfidence:0}],eventCount:47,limitations:{flaggedForHumanReview:["Jurisdictional nuances for multi-state compliance","Industry-specific regulatory interpretations"],confidenceIntervals:"",disclaimer:"This analysis was produced by an AI system with multi-agent verification. For matters involving regulatory filings, litigation, or binding contractual obligations, we recommend independent counsel verification."},nextSteps:[{label:"Review the transformed document",description:"Compare the before and after versions side by side. Pay particular attention to sections where complex legal language was simplified — verify the plain-language version captures your intended meaning.",kind:"action"},{label:"Test with your audience",description:"Share the document with 2-3 representative readers from your target audience. Ask them to explain key obligations in their own words — if they can, the readability improvements are working.",kind:"action"},{label:"Update your style guide",description:"The heading structure and language patterns used in this transformation can serve as a template for future documents. Consider adopting the three-level heading system as your standard.",kind:"action"},{label:"Schedule a 90-day review",description:"Set a reminder to review the document after 90 days of use. Collect feedback from users and identify any sections that cause confusion or questions.",kind:"schedule"},{label:"Accessibility testing recommended",description:"While the document meets WCAG 2.1 AA standards, consider testing with actual assistive technology (screen readers, high-contrast mode) before publishing to your website.",kind:"watchout"}]}}function Qe(o){return{sessionId:o,status:"Complete",documentTitle:"HeartConnect Terms of Service",executiveSummary:"A comprehensive Terms of Service has been drafted for HeartConnect, an online dating platform. The document covers 16 sections including eligibility, subscriptions, data usage, safety, dispute resolution, and EU consumer protections. Seven specialists collaborated across privacy, regulatory, plain language, ethics, design, contract review, and synthesis. Three critical findings were identified and resolved: GDPR consent bundling, age verification gaps, and algorithmic transparency. Final readability: Grade 7.8 (down from Grade 16.8). Cost: $7.82 of $12.00 budget.",keyChanges:[{title:"⛔ Privacy — GDPR Consent Bundling",before:"Data processing consent was bundled with Terms acceptance, violating GDPR Article 7 requirement for freely given, specific, informed consent.",after:"Separated data processing consent into dedicated section (Section 6) with granular opt-in controls. Privacy Policy referenced separately with explicit link."},{title:"⛔ Regulatory — Age Verification Gap",before:"Platform relied solely on self-certification for age verification with no mechanism to detect or prevent underage access.",after:"Added multi-layer verification: self-certification at signup, right to request ID verification at any time, explicit parental consent requirement for users under legal majority (Section 2)."},{title:"⛔ Ethics — Algorithmic Transparency",before:"No disclosure of how matching algorithms work, what data influences match suggestions, or how user behavior affects recommendations.",after:"Added transparency language in Sections 6 and 7: matching uses profile data and activity patterns, users can request explanation of match suggestions."},{title:"⚠️ Readability — Dense Legal Language",before:"Original draft at Flesch-Kincaid Grade 16.8 — post-graduate reading level with nested subordinate clauses and passive voice throughout.",after:"Rewritten to Grade 7.8 with active voice, short sentences, plain-language explanations alongside legal terms. Safety section (Section 9) at Grade 5 for maximum accessibility."},{title:"⚠️ Consumer Protection — EU User Rights",before:"Arbitration clause applied globally with no carve-out for EU consumers protected by mandatory consumer protection directives.",after:"Added explicit EU user exceptions throughout: 14-day withdrawal right (Section 5), GDPR rights (Section 6), arbitration opt-out for EU consumers (Section 12), Rome I Regulation acknowledgment (Section 15)."}],dimensions:[{dimension:"Readability",before:1.2,after:3.9,delta:2.7},{dimension:"Findability",before:1.8,after:3.6,delta:1.8},{dimension:"Clarity",before:1.5,after:4,delta:2.5},{dimension:"Visual Design",before:2,after:3.8,delta:1.8},{dimension:"Ethics",before:1.4,after:3.5,delta:2.1}],finalOutput:Ze,debateResolutions:[{topic:"GDPR consent bundling — severity and remediation",resolution:"Upgraded to RED. Consent must be unbundled per GDPR Article 7. Separate data processing consent added with granular controls.",winningPosition:"Privacy Counsel's position that bundled consent is per se invalid under GDPR prevailed over Contract Reviewer's argument that a single acceptance is standard practice.",evidenceWeight:"GDPR Article 7, EDPB Guidelines on consent, Schrems II precedent. Regulatory risk is dispositive.",escalationNeeded:!1,confidence:.94},{topic:"Arbitration clause — EU consumer applicability",resolution:"Added explicit EU carve-out. EU consumers retain right to bring claims in home courts per Brussels Regulation. Arbitration remains for US users with 30-day opt-out.",winningPosition:"Regulatory Counsel's position that mandatory arbitration is unenforceable against EU consumers under Directive 93/13/EEC prevailed.",evidenceWeight:"EU Consumer Rights Directive, Brussels Regulation, Rome I Regulation. Platform cannot override mandatory consumer protection.",escalationNeeded:!1,confidence:.91}],gateDecisions:[{gateType:"ethics critical",decision:"approve",summary:"Three RED findings (GDPR consent, age verification, algorithmic transparency) approved for remediation. All affect user safety and regulatory compliance."},{gateType:"meaning preservation",decision:"approve",summary:"Plain language rewrite verified — all legal obligations, rights, limitations, and remedies preserved. No semantic drift detected across 16 sections."},{gateType:"final delivery",decision:"approve",summary:"All verification checks passed. Document meets readability, regulatory, and ethical standards."}],verificationChecks:[{type:"readability",passed:!0,label:"Readability (Grade 7.8)",score:.95},{type:"regulatory",passed:!0,label:"Regulatory Compliance",score:.89},{type:"accessibility",passed:!0,label:"Accessibility (WCAG AA)",score:.82},{type:"legal-accuracy",passed:!0,label:"Legal Accuracy",score:.93},{type:"ethics",passed:!0,label:"Ethics Review",score:.88}],narrative:[{phase:"Analysis",heading:"Seven specialists examine a dating platform ToS",body:"The engagement began with seven specialists simultaneously reviewing HeartConnect's Terms of Service draft. Privacy Counsel immediately flagged GDPR consent bundling — the draft combined data processing consent with Terms acceptance, a structure that violates Article 7. Regulatory Counsel identified age verification gaps: self-certification alone is insufficient for a dating platform serving potentially vulnerable users. The Plain Language Specialist measured readability at Grade 16.8, well above the target.",agents:["Privacy Counsel","Regulatory Counsel","Plain Language Specialist","Ethics Auditor","Design Reviewer","Contract Reviewer","Synthesis Editor"]},{phase:"First Debate",heading:"Privacy vs. convenience — the consent bundling challenge",body:"The Contract Reviewer argued that a single Terms acceptance is industry standard and simplifies onboarding. Privacy Counsel challenged this directly: under GDPR, consent for data processing must be freely given, specific, and informed — bundling it with Terms acceptance fails all three requirements. The Ethics Auditor supported the challenge, noting that dating platforms process especially sensitive data (sexual orientation, relationship preferences). The debate was resolved in favor of unbundled consent.",agents:["Privacy Counsel","Contract Reviewer","Ethics Auditor"],highlight:"This debate changed the fundamental consent architecture of the document — from single acceptance to granular opt-in."},{phase:"Ethics Gate",heading:"Three critical findings flagged for human review",body:"The ethics gate was triggered by three RED findings: GDPR consent bundling, age verification gaps, and missing algorithmic transparency. All three directly affect user safety on a dating platform — privacy violations could expose sensitive personal data, inadequate age verification could put minors at risk, and opaque algorithms could enable discriminatory matching. The gate approved proceeding with full remediation.",agents:[],highlight:"The ethics gate ensured all three issues were treated as safety-critical, not just compliance checkboxes."},{phase:"Transformation",heading:"Rewriting 16 sections in plain language",body:"The Plain Language Specialist rewrote all 16 sections to Grade 7.8 reading level while the Synthesis Editor ensured structural coherence. The safety section (Section 9) was given special attention — written at Grade 5 level because safety information must be accessible to all users regardless of education. EU consumer protections were woven throughout rather than confined to a single section, following the principle that rights should be visible where they apply.",agents:["Plain Language Specialist","Synthesis Editor"]},{phase:"Verification",heading:"Five independent checks — all passed",body:"Five verification checks confirmed the document meets all targets: readability (Grade 7.8), regulatory compliance (GDPR, CCPA, EU Consumer Rights Directive), accessibility (WCAG AA), legal accuracy (no semantic drift across 16 sections), and ethics review (consent architecture, age verification, algorithmic transparency all addressed). The legal accuracy check was the most intensive, comparing every obligation, right, and limitation between the original draft and the final version.",agents:[]},{phase:"Delivery",heading:"Work product delivered",body:"All workflow steps completed. The HeartConnect Terms of Service has been drafted with 16 sections covering the full scope of a dating platform's legal requirements. The document is ready for client review and independent counsel verification.",agents:[]}],debate:{findingsCount:7,challengesCount:2,resolutionsCount:2,unresolvedCount:0},verification:{resultsCount:5,passed:5,failed:0,confidence:.93,breakdown:[{type:"self",passed:!0,confidence:.95,label:"Readability Check"},{type:"cross",passed:!0,confidence:.89,label:"Regulatory Cross-Check"},{type:"score",passed:!0,confidence:.93,label:"Legal Accuracy Score"}]},cost:{accumulated:7.82,budget:12,remaining:4.18},agentPerformance:[{name:"Privacy Counsel",role:"privacy-counsel",findingsPosted:2,challengesSurvived:1,avgConfidence:.94},{name:"Regulatory Counsel",role:"regulatory-counsel",findingsPosted:1,challengesSurvived:0,avgConfidence:.91},{name:"Plain Language Specialist",role:"plain-language-specialist",findingsPosted:1,challengesSurvived:0,avgConfidence:.95},{name:"Ethics Auditor",role:"ethics-auditor",findingsPosted:1,challengesSurvived:1,avgConfidence:.88},{name:"Design Reviewer",role:"design-reviewer",findingsPosted:1,challengesSurvived:0,avgConfidence:.85},{name:"Contract Reviewer",role:"contract-reviewer",findingsPosted:1,challengesSurvived:0,avgConfidence:.9},{name:"Synthesis Editor",role:"synthesis-editor",findingsPosted:0,challengesSurvived:0,avgConfidence:0}],eventCount:52,limitations:{flaggedForHumanReview:["Age verification mechanism requires legal review for jurisdiction-specific requirements","Arbitration clause EU carve-out should be reviewed by EU-qualified counsel","GDPR consent flow implementation requires UX/UI design review"],confidenceIntervals:"",disclaimer:"This analysis was produced by an AI system with multi-agent verification. For matters involving regulatory filings, litigation, or binding contractual obligations, we recommend independent counsel verification."},nextSteps:[{label:"Review with qualified counsel",description:"Have a licensed attorney review the complete Terms of Service, paying special attention to the GDPR consent architecture, arbitration clause, and age verification requirements.",kind:"action"},{label:"Implement consent UX",description:"The unbundled consent architecture requires a separate consent flow in the app — work with your UX team to design granular opt-in screens that are clear and non-coercive.",kind:"action"},{label:"Age verification vendor",description:"Evaluate age verification service providers that comply with applicable data protection laws. Self-certification alone is insufficient for a dating platform.",kind:"action"},{label:"EU market launch review",description:"If launching in the EU, engage local counsel to verify compliance with each member state's consumer protection implementation.",kind:"watchout"},{label:"Schedule 6-month legal audit",description:"Dating platform regulations are evolving rapidly. Schedule a comprehensive review in 6 months to address any new requirements from the EU Digital Services Act or state-level dating safety laws.",kind:"schedule"}]}}const Ze=`# HeartConnect Terms of Service

**DRAFT — For Client Review**  ·  *Plain-language redesign by Lavern*
*Effective Date: [Effective Date]*  ·  *Readability: Grade 7.8 (was 16.8)*

---

> **TL;DR — What you actually need to know:**
> - You must be **18 or older** to use HeartConnect.
> - Your subscription **auto-renews** — cancel any time in Settings before renewal.
> - EU users: you have a **14-day withdrawal right** and don’t have to arbitrate.
> - We do **not** conduct background checks on users. Stay safe out there.
> - We don’t sell your data. Your content is yours.

---

## Table of Contents

1. Welcome / Agreement to Terms
2. Who Can Use HeartConnect (Eligibility)
3. Your Account
4. What’s Free and What’s Premium (Subscription Terms)
5. Auto-Renewal and Cancellation
6. How We Use Your Data
7. Your Content
8. Rules of Conduct
9. Safety and Interactions with Other Users
10. Our Disclaimers
11. Limitation of Liability
12. Dispute Resolution and Arbitration
13. Account Suspension and Termination
14. Changes to These Terms
15. General Provisions
16. Contact Us

---

## 1. Welcome / Agreement to Terms

Welcome to HeartConnect! These Terms of Service (“Terms”) are a legal agreement between you and HeartConnect LLC, a Delaware limited liability company (“HeartConnect,” “we,” “us,” or “our”). They govern your use of the HeartConnect website, mobile application, and all related services (collectively, the “Service”).

By creating an account, accessing, or using HeartConnect, you agree to be bound by these Terms. If you do not agree, please do not use the Service.

These Terms also incorporate our Privacy Policy, available at [LINK], which describes how we collect, use, and protect your personal information. Please read it carefully.

We’ve written these Terms in plain language so you can understand your rights and responsibilities. Where we use a legal term, we’ll explain what it means.

## 2. Who Can Use HeartConnect (Eligibility)

To use HeartConnect, you must meet all of the following requirements:

- **You must be at least 18 years old.** HeartConnect is not intended for anyone under the age of 18. By creating an account, you confirm that you are 18 or older.
- **You must be legally able to enter into a binding agreement.** If you are under the legal age of majority in your jurisdiction (even if over 18), you represent that you have parental or guardian consent to use the Service.
- **You must not be prohibited from using the Service under applicable law.** This includes any laws of the United States, the European Union, or any other jurisdiction that applies to you.
- **You must not have been previously banned or removed from HeartConnect.**

We may ask you to verify your age or identity at any time. By using the Service, you acknowledge that we rely on your self-certification of eligibility, and you agree that providing false information about your age or identity is a violation of these Terms.

## 3. Your Account

### Creating Your Account

To use HeartConnect, you need to create an account. When you sign up, you agree to:

- Provide accurate, current, and complete information about yourself.
- Keep your account information up to date.
- Keep your password secure and confidential.
- Accept responsibility for all activity that occurs under your account.

### One Account Per Person

Each person may maintain only one HeartConnect account. If we discover duplicate accounts, we may close or merge them at our discretion.

### Account Security

You are responsible for maintaining the security of your account. If you believe your account has been compromised, please contact us immediately at [EMAIL]. We are not liable for any losses resulting from unauthorized use of your account where you have failed to keep your credentials secure.

## 4. What’s Free and What’s Premium (Subscription Terms)

### Free Features

HeartConnect offers a free tier that gives you access to basic features, including creating a profile, browsing other users, and limited messaging. The specific features available for free may change from time to time.

### Premium Subscription

HeartConnect also offers a premium subscription (“HeartConnect Premium”) that provides access to additional features. The specific premium features and subscription plans (including pricing and duration) are described on our website and in the app at the time of purchase.

By purchasing a Premium subscription, you agree to pay the applicable fees. All fees are stated in U.S. dollars unless otherwise indicated at the point of sale.

### Payment

When you subscribe to HeartConnect Premium, you authorize us (or our third-party payment processor) to charge the payment method you provide. You are responsible for ensuring your payment information is current and that all charges can be processed. If a payment fails, we may suspend your access to Premium features until payment is received.

### Taxes

All fees are exclusive of applicable taxes unless stated otherwise. You are responsible for any applicable taxes associated with your subscription.

## 5. Auto-Renewal and Cancellation

### Auto-Renewal

Your HeartConnect Premium subscription will automatically renew at the end of each subscription period (e.g., monthly or annually) unless you cancel before the renewal date. When your subscription renews, we will charge the same payment method at the then-current subscription rate. We will send you a reminder before each renewal.

By subscribing, you consent to this auto-renewal arrangement. This means charges will continue to recur until you actively cancel.

### How to Cancel

You can cancel your Premium subscription at any time through any of the following methods:

- **In the app:** Go to Settings > Subscription > Cancel Subscription.
- **On our website:** Visit your Account Settings page at [LINK].
- **By email:** Send a cancellation request to [EMAIL].
- **Through your app store:** If you subscribed through Apple’s App Store or Google Play, you must cancel through that platform’s subscription management settings.

Cancellation takes effect at the end of your current billing period. You will continue to have access to Premium features until your current period expires, but you will not be charged again.

### Refunds

Fees already charged are generally non-refundable, except:

- **If required by applicable law.** For example, certain U.S. state laws and EU consumer protection laws may entitle you to a refund in specific circumstances.
- **EU users:** If you are a consumer located in the European Union, you have the right to withdraw from your Premium subscription within 14 days of your initial purchase, without giving any reason, and receive a full refund. This withdrawal right is provided under the EU Consumer Rights Directive. To exercise this right, contact us at [EMAIL] within 14 days of purchase. Please note: if you begin using Premium features during the 14-day withdrawal period, we may deduct a proportionate amount for the services you received before cancellation.
- **At our discretion.** We may, but are not obligated to, offer refunds or credits on a case-by-case basis.

### Price Changes

We may change our subscription pricing from time to time. If we increase the price of your current subscription, we will notify you at least 30 days before the change takes effect. The new price will apply to your next renewal period. If you do not agree to the new price, you may cancel before the renewal date.

## 6. How We Use Your Data

Your privacy matters to us — especially on a platform where you share personal and sensitive information. This section provides a summary of our data practices. For full details, please read our Privacy Policy at [LINK].

### What We Collect

We collect information you provide to us (such as your name, email address, date of birth, photos, profile information, and preferences), information generated by your use of the Service (such as activity logs, device information, and location data), and information from third parties (such as social media accounts you link to your profile).

### How We Use It

We use your information to:

- Provide, operate, and improve the Service.
- Suggest potential matches and personalize your experience.
- Process payments for Premium subscriptions.
- Communicate with you about your account, updates, and promotions (with your consent where required).
- Enforce these Terms and protect the safety and security of our users.

### How We Share It

We do not sell your personal information. We may share your information with:

- **Other users:** Your profile information is visible to other HeartConnect users as part of the Service.
- **Service providers:** Third-party companies that help us operate the Service (e.g., payment processors, hosting providers, analytics services).
- **Legal obligations:** When required by law, regulation, or legal process.
- **Safety:** When we believe disclosure is necessary to protect the rights, safety, or property of HeartConnect, our users, or others.

### Data Retention

We retain your information for as long as your account is active and for a reasonable period afterward as needed for legal, security, and business purposes. You can request deletion of your account and personal data at any time, subject to our legal obligations.

### Your Rights

Depending on where you live, you may have certain rights regarding your personal data, including the right to access, correct, delete, or port your data. EU users have specific rights under the General Data Protection Regulation (GDPR). Please see our Privacy Policy at [LINK] for details on how to exercise these rights.

## 7. Your Content

### Content You Create

When you use HeartConnect, you may upload photos, write profile descriptions, send messages, and share other content (“Your Content”). You retain ownership of Your Content.

### License You Grant Us

By uploading or sharing Your Content on HeartConnect, you grant us a worldwide, non-exclusive, royalty-free, transferable, sublicensable license to use, reproduce, modify, adapt, display, and distribute Your Content — but only for the purposes of operating, providing, promoting, and improving the Service.

In plain language: we need the right to show your profile to other users, display your photos in the app, and potentially use anonymized or aggregated content (such as a testimonial you’ve consented to) in marketing materials. We will not sell Your Content to third parties.

This license ends when you delete Your Content or your account, except where Your Content has been shared with other users (e.g., messages) and they have not deleted it, or where we are required to retain it for legal purposes.

### Content Standards

Your Content must comply with these Terms and all applicable laws. You represent and warrant that:

- You own or have the necessary rights to Your Content.
- Your Content does not infringe any third party’s intellectual property, privacy, or other rights.
- Your Content is not false, misleading, or deceptive.

We may (but are not obligated to) review, monitor, or remove Your Content at any time and for any reason, including if we believe it violates these Terms.

## 8. Rules of Conduct

HeartConnect is meant to be a safe and respectful environment for everyone. When using the Service, you agree not to:

### Harmful Behavior

- Harass, bully, stalk, intimidate, or threaten any other user.
- Engage in any form of hate speech or discrimination based on race, ethnicity, national origin, religion, gender, gender identity, sexual orientation, disability, or any other protected characteristic.
- Send unsolicited sexual content or messages.
- Engage in any conduct that is abusive, harmful, or offensive.

### Fraud and Deception

- Create a fake profile or impersonate any person or entity.
- Use the Service for any commercial purpose, including solicitation, advertising, or promoting products or services.
- Scam, defraud, or deceive other users, including catfishing.
- Request money or financial information from other users.

### Illegal Activity

- Use the Service for any unlawful purpose.
- Post or share content involving the sexual exploitation of minors. We report all instances of child sexual abuse material (CSAM) to the National Center for Missing & Exploited Children (NCMEC) and applicable law enforcement.
- Engage in human trafficking, prostitution, or solicitation.
- Violate any applicable local, state, national, or international law.

### Platform Integrity

- Use bots, scripts, or automated methods to access or interact with the Service.
- Attempt to gain unauthorized access to other users’ accounts or HeartConnect’s systems.
- Reverse-engineer, decompile, or disassemble any part of the Service.
- Interfere with or disrupt the Service or its servers or networks.
- Scrape, harvest, or collect information about other users without their consent.

### Reporting Violations

If you encounter behavior that violates these Terms, please report it through the in-app reporting feature or by contacting us at [EMAIL]. We take reports seriously and will investigate them promptly. Reporting is confidential.

## 9. Safety and Interactions with Other Users

### Your Responsibility

HeartConnect is a platform that connects people, but we cannot control what happens between users. You are solely responsible for your interactions with other users, whether online or in person. We encourage you to exercise caution and good judgment.

### Safety Tips

We strongly recommend that you:

- **Do not share personal information too quickly.** Avoid sharing your home address, phone number, financial information, or workplace details with someone you have just met on the platform.
- **Meet in public places.** If you decide to meet someone in person, choose a public location for your first meetings.
- **Tell someone you trust.** Let a friend or family member know where you are going and who you are meeting.
- **Trust your instincts.** If something feels wrong, end the interaction. You can always block and report another user.
- **Never send money.** Do not send money or financial information to anyone you meet through HeartConnect.

### No Background Checks

HeartConnect does not conduct criminal background checks, identity verification, or screening of its users. We do not verify the statements or representations made by users in their profiles. You should not assume that any user is who they claim to be.

We are not responsible for the conduct of any user, whether on or off the platform.

## 10. Our Disclaimers

Please read this section carefully. It limits certain rights you might otherwise have.

### No Guarantees of Matches or Outcomes

HeartConnect does not guarantee that you will find a match, a date, or a relationship through the Service. We provide a platform to connect people, but the success of any connection depends entirely on the individuals involved.

### “As Is” Service

To the fullest extent permitted by applicable law, the Service is provided on an “AS IS” and “AS AVAILABLE” basis, without warranties of any kind, either express or implied. We disclaim all warranties, including implied warranties of merchantability, fitness for a particular purpose, title, and non-infringement.

**EU users:** This disclaimer does not affect your statutory rights as a consumer under applicable EU law, including mandatory warranty protections. Where our disclaimers conflict with your mandatory consumer rights, your consumer rights prevail.

## 11. Limitation of Liability

### Exclusion of Certain Damages

To the fullest extent permitted by applicable law, HeartConnect, its officers, directors, employees, agents, and affiliates will not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to: loss of profits, data, use, or goodwill; emotional distress arising from interactions with other users; the conduct or content of any user; or unauthorized access to or alteration of your data.

### Cap on Liability

Our total cumulative liability to you for any and all claims arising from or related to the Service will not exceed the greater of: (a) the amount you paid to HeartConnect in the 12 months preceding the claim, or (b) one hundred U.S. dollars ($100).

### Exceptions

The limitations in this section do not apply to liability that cannot be excluded or limited under applicable law. For EU users, this includes liability arising from gross negligence, willful misconduct, or fraud.

## 12. Dispute Resolution and Arbitration

*This section contains an arbitration agreement and a class action waiver. Please read it carefully — it affects your legal rights.*

### Informal Resolution First

Before starting any formal dispute proceeding, you agree to contact us at [EMAIL] and describe the issue. We will try to resolve it informally within 30 days. Most concerns can be resolved this way.

### Binding Arbitration

If we cannot resolve a dispute informally, you and HeartConnect agree to resolve any claims through final and binding arbitration, rather than in court. Arbitration will be administered by the American Arbitration Association (AAA) under its Consumer Arbitration Rules.

We will pay all AAA filing, administration, and arbitrator fees for claims of $10,000 or less, unless the arbitrator determines your claim is frivolous.

### Class Action Waiver

You and HeartConnect each agree that any dispute resolution proceedings will be conducted only on an individual basis and not in a class, consolidated, or representative action.

### Opt-Out Right

You have the right to opt out of this arbitration agreement by sending written notice to [EMAIL] within 30 days of creating your HeartConnect account.

### EU Users

If you are a consumer located in the European Union, you are not required to arbitrate disputes. You retain the right to bring claims in the courts of your country of residence, as provided under mandatory EU consumer protection law. You may also use the European Commission’s Online Dispute Resolution platform.

## 13. Account Suspension and Termination

### Termination by You

You may delete your account at any time through the app (Settings > Account > Delete Account) or by contacting us at [EMAIL]. Deleting your account will remove your profile from the Service and end your access to all features. Please cancel your Premium subscription first (see Section 5).

### Termination by Us

We may suspend or terminate your account if we believe you have violated these Terms, your conduct poses a risk to other users’ safety, your account is being used for fraudulent or unauthorized purposes, or continued provision of the Service to you is impractical.

We will make reasonable efforts to provide notice of termination and the reasons for it, unless doing so would compromise the safety of others or an ongoing investigation.

### Effect of Termination

Upon termination, your license to use the Service immediately ends. We may delete your account data in accordance with our Privacy Policy and applicable law. Sections intended to survive termination include Sections 7, 10, 11, 12, and 15.

## 14. Changes to These Terms

We may update these Terms from time to time. When we make changes, we will update the “Effective Date” at the top and notify you of material changes at least 30 days before they take effect.

Your continued use of the Service after the updated Terms take effect constitutes your acceptance of the changes. If you do not agree, you should stop using the Service and delete your account.

**For EU users:** Where required by applicable law, we will seek your affirmative consent to material changes.

## 15. General Provisions

**Entire Agreement.** These Terms, together with the Privacy Policy, constitute the entire agreement between you and HeartConnect regarding your use of the Service.

**Severability.** If any provision is found invalid or unenforceable, it will be modified to the minimum extent necessary. The remaining provisions continue in full force.

**No Waiver.** Our failure to enforce any right does not constitute a waiver of that right.

**Assignment.** You may not assign your rights without our written consent. We may assign ours without restriction.

**Force Majeure.** We are not liable for failures resulting from causes beyond our reasonable control.

**Governing Law.** These Terms are governed by the laws of the State of Delaware, United States, without regard to conflict of laws principles. **For EU users:** This choice of law does not deprive you of mandatory protections under the law of your country of habitual residence under the Rome I Regulation.

## 16. Contact Us

If you have questions about these Terms, your account, or anything else related to HeartConnect, we’d love to hear from you.

**HeartConnect LLC**
Email: [EMAIL]
Mailing Address: [Mailing Address]
Website: [LINK]

For privacy-related inquiries, please see our Privacy Policy at [LINK] or email our data protection team at [EMAIL].

---

*These Terms of Service were last updated on [Effective Date].*
*© [Year] HeartConnect LLC. All rights reserved.*

---

*Prepared by Lavern — Multi-Agent Legal Design System*
*This document was produced with AI assistance. It does not constitute legal advice. Always verify with qualified legal professionals.*
`;function et(o){return{sessionId:o,status:"Complete",documentTitle:"MediVault Privacy Policy",executiveSummary:"A comprehensive Privacy Policy has been drafted for MediVault, a health technology platform processing patient records under both HIPAA and GDPR. Six specialists collaborated across privacy, regulatory, compliance, plain language, risk pricing, and synthesis. Two critical findings were identified and resolved: inadequate HIPAA PHI disclosures and legally deficient cross-border transfer mechanisms. A dual-track breach notification process was designed for the US-EU operational split. Final document includes de-identification methodology disclosure for Series B due diligence confidence. Cost: $6.41 of $15.00 budget.",keyChanges:[{title:"⛔ HIPAA — PHI Processing Disclosure",before:"Health data treated identically to general personal data. No mention of Business Associate Agreements, minimum necessary standard, or HIPAA-specific patient rights.",after:"Dedicated PHI processing section with BAA requirements, minimum necessary standard, and complete patient rights (access, amendment, accounting of disclosures)."},{title:"⛔ Cross-Border — US-EU Data Transfers",before:'Generic statement that data "may be transferred internationally" with no legal basis specified.',after:"Full transfer mechanism documentation: Standard Contractual Clauses with supplementary technical measures (AES-256 encryption, TLS 1.3, pseudonymization)."},{title:"⚠️ Compliance — Breach Notification",before:'Single "30-day notification" promise that contradicts both HIPAA (60 days) and GDPR (72 hours) requirements.',after:"Dual-track notification: GDPR 72-hour authority notification, HIPAA 60-day individual notification, 24-hour maximum internal escalation between Berlin and US teams."},{title:"⚠️ Data Retention — Medical Records",before:"Promise to delete data on account closure, conflicting with medical records retention laws (7-10 years) and HIPAA 6-year requirement.",after:"Tiered retention schedule: account data deleted on closure, medical records retained per applicable state law, HIPAA records retained for 6 years minimum."},{title:"✅ Due Diligence — De-identification Disclosure",before:"No mention of data de-identification methodology for analytics processing.",after:"Explicit de-identification methodology section specifying HIPAA Safe Harbor method, periodic re-identification risk assessments, and clear distinction between identified PHI and de-identified analytics data."}],dimensions:[{dimension:"HIPAA Compliance",before:1,after:4.2,delta:3.2},{dimension:"GDPR Compliance",before:1.4,after:3.9,delta:2.5},{dimension:"Readability",before:1.6,after:3.7,delta:2.1},{dimension:"Breach Response",before:.8,after:4,delta:3.2},{dimension:"Investor Confidence",before:1.2,after:3.8,delta:2.6}],finalOutput:tt,debateResolutions:[{topic:"De-identification methodology disclosure",resolution:"Privacy policy will include explicit HIPAA de-identification methodology (Safe Harbor method) with periodic risk assessments. Serves both compliance and Series B due diligence purposes.",winningPosition:"Compliance Officer's due diligence perspective refined the privacy approach. Investors need to see MediVault understands the HIPAA de-identification framework.",evidenceWeight:"HIPAA de-identification standards (45 CFR 164.514) and Series B due diligence expectations both support detailed methodology disclosure.",escalationNeeded:!1,confidence:.92},{topic:"Cross-border breach notification timeline",resolution:"Dual-track breach notification adopted. EU-discovered breaches trigger parallel GDPR notification and US HIPAA assessment tracks with 24-hour maximum internal escalation.",winningPosition:"Regulatory Counsel's cross-border perspective was critical. The Berlin team discovery scenario could create a compliance gap if not explicitly addressed.",evidenceWeight:'GDPR 72-hour and HIPAA 60-day timelines both run from "awareness." Dual-track process prevents either clock from being missed.',escalationNeeded:!1,confidence:.95}],gateDecisions:[{gateType:"ethics critical",decision:"approve",summary:"Two RED findings (HIPAA PHI processing, cross-border transfers) and two YELLOW findings (breach notification, data retention) approved for remediation."},{gateType:"final delivery",decision:"approve",summary:"All five verification checks passed. HIPAA and GDPR compliance confirmed. Cross-border transfer mechanisms validated."}],verificationChecks:[{type:"hipaa-compliance",passed:!0,label:"HIPAA Compliance",score:.94},{type:"gdpr-compliance",passed:!0,label:"GDPR Compliance",score:.92},{type:"readability",passed:!0,label:"Readability",score:.9},{type:"cross-border-transfer",passed:!0,label:"Cross-Border Transfer",score:.91},{type:"legal-accuracy",passed:!0,label:"Legal Accuracy",score:.95}],narrative:[{phase:"Analysis",heading:"Six specialists examine a health tech privacy policy",body:"The engagement began with six specialists simultaneously reviewing MediVault's privacy policy draft. Privacy Counsel immediately identified that the policy treats health data identically to general personal data, with no HIPAA-specific PHI disclosures. Regulatory Counsel flagged the cross-border transfer section as legally deficient post-Schrems II. The Compliance Officer discovered internally contradictory breach notification timelines.",agents:["Privacy Counsel","Regulatory Counsel","Compliance Officer","Plain Language Specialist","Risk Pricer","Synthesis Editor"]},{phase:"First Debate",heading:"De-identification and the investor perspective",body:"The Compliance Officer challenged the HIPAA finding with a strategic insight: MediVault should disclose its de-identification methodology in the privacy policy. This serves dual purposes — regulatory compliance and investor confidence during Series B due diligence. Privacy Counsel accepted the challenge and expanded the recommendation to include a dedicated section explaining de-identification methodology and distinguishing identified PHI from de-identified analytics.",agents:["Compliance Officer","Privacy Counsel"],highlight:"This debate elevated the privacy policy from a compliance document to a strategic asset for fundraising."},{phase:"Second Debate",heading:"The Berlin team problem — dual-track breach notification",body:"Regulatory Counsel raised a critical operational scenario: if the Berlin engineering team discovers a breach, GDPR's 72-hour clock starts at EU discovery, but HIPAA's clock may not start until the US entity is notified. Without explicit internal escalation procedures, a cross-Atlantic communication delay could violate both regimes. The team adopted a dual-track process with a 24-hour maximum internal escalation window.",agents:["Regulatory Counsel","Compliance Officer"],highlight:"This scenario-based debate prevented a real operational compliance gap that would only surface during an actual incident."},{phase:"Transformation",heading:"Building HIPAA and GDPR compliance in parallel",body:"Privacy Counsel drafted HIPAA-compliant PHI disclosures and a de-identification methodology section. Regulatory Counsel specified cross-border transfer mechanisms including Standard Contractual Clauses with supplementary technical measures. The first quality check failed on two specificity gaps: de-identification method and encryption standards. After revision, the second check passed at 93%.",agents:["Privacy Counsel","Regulatory Counsel","Plain Language Specialist"]},{phase:"Verification",heading:"Five independent checks — all passed",body:"Five verification checks confirmed compliance: HIPAA compliance (PHI handling, BAA requirements, patient rights), GDPR compliance (lawful basis, data subject rights, DPO provisions), readability (accessible to patient audience), cross-border transfer validity (SCCs with supplementary measures), and legal accuracy (no unintended obligations or gaps).",agents:[]},{phase:"Delivery",heading:"Work product delivered",body:"All workflow steps completed. The MediVault Privacy Policy has been drafted with full HIPAA and GDPR compliance, dual-track breach notification, cross-border transfer mechanisms, and de-identification methodology disclosure. The document is ready for client review and Series B due diligence.",agents:[]}],debate:{findingsCount:4,challengesCount:2,resolutionsCount:2,unresolvedCount:0},verification:{resultsCount:5,passed:5,failed:0,confidence:.92,breakdown:[{type:"self",passed:!0,confidence:.94,label:"HIPAA Compliance Check"},{type:"cross",passed:!0,confidence:.92,label:"GDPR Cross-Check"},{type:"score",passed:!0,confidence:.95,label:"Legal Accuracy Score"}]},cost:{accumulated:6.41,budget:15,remaining:8.59},agentPerformance:[{name:"Privacy Counsel",role:"privacy-counsel",findingsPosted:1,challengesSurvived:1,avgConfidence:.96},{name:"Regulatory Counsel",role:"regulatory-counsel",findingsPosted:1,challengesSurvived:0,avgConfidence:.93},{name:"Compliance Officer",role:"compliance-officer",findingsPosted:2,challengesSurvived:1,avgConfidence:.9},{name:"Plain Language Specialist",role:"plain-language-specialist",findingsPosted:0,challengesSurvived:0,avgConfidence:0},{name:"Risk Pricer",role:"risk-pricer",findingsPosted:0,challengesSurvived:0,avgConfidence:0},{name:"Synthesis Editor",role:"synthesis-editor",findingsPosted:0,challengesSurvived:0,avgConfidence:0}],eventCount:48,limitations:{flaggedForHumanReview:["HIPAA BAA template should be reviewed by health law counsel before execution","Cross-border transfer supplementary measures should be validated by data protection officer","State-specific medical records retention periods vary and require jurisdiction review"],confidenceIntervals:"",disclaimer:"This analysis was produced by an AI system with multi-agent verification. For matters involving regulatory filings, litigation, or binding contractual obligations, we recommend independent counsel verification."},nextSteps:[{label:"Engage health law counsel",description:"Have a HIPAA-qualified attorney review the privacy policy, particularly the PHI processing disclosures, BAA requirements, and de-identification methodology section.",kind:"action"},{label:"Validate transfer mechanisms",description:"Confirm Standard Contractual Clauses and supplementary technical measures with your Data Protection Officer and Berlin engineering team.",kind:"action"},{label:"Series B data room",description:"Include the privacy policy, de-identification methodology documentation, and breach notification procedures in your Series B data room for investor review.",kind:"action"},{label:"Berlin team training",description:"Ensure the Berlin engineering team understands the dual-track breach notification process and their role in the 24-hour internal escalation window.",kind:"watchout"},{label:"Annual HIPAA risk assessment",description:"Schedule the first annual HIPAA security risk assessment and de-identification re-evaluation within 90 days of policy adoption.",kind:"schedule"}]}}const tt=`# MediVault Privacy Policy

**DRAFT — For Client Review**  ·  *Compliance redesign by Lavern*
*Effective Date: [Effective Date]*  ·  *Jurisdiction: United States + European Union*

---

| Regulatory Framework | Status | Primary Contact |
|---|---|---|
| HIPAA / HITECH | ✅ Compliant | HIPAA Privacy Officer |
| GDPR (EU/UK) | ✅ Compliant | Data Protection Officer (Berlin) |
| CCPA / CPRA (California) | ✅ Compliant | privacy@medivault.com |
| State Medical Records Laws | ✅ Mapped | See Section 11 |

> **For Series B due diligence:** This policy discloses our de-identification methodology (HIPAA Safe Harbor, 45 CFR § 164.514), cross-border transfer mechanism (Standard Contractual Clauses + AES-256 supplementary measures), and dual-track breach notification process. Sections 5, 7, 10, and 13 are written specifically for investor review.

---

## Table of Contents

1. Introduction and Scope
2. Who We Are — Data Controller and DPO
3. Information We Collect
4. Legal Basis for Processing (GDPR)
5. Protected Health Information (PHI) and HIPAA
6. Data De-identification Methodology
7. How We Use Your Information
8. Cookies and Tracking Technologies
9. How We Share Your Information
10. International Data Transfers
11. Data Retention Schedule
12. Data Security
13. Breach Notification
14. Your Privacy Rights
15. California Residents (CCPA/CPRA)
16. Children’s Privacy
17. Changes to This Policy
18. Contact Us

---

## 1. Introduction and Scope

MediVault, Inc. (“MediVault,” “we,” “us,” or “our”) provides a cloud-based health technology platform that enables medical providers to securely store, access, and manage patient records. This Privacy Policy (“Policy”) applies to all information we collect through the MediVault platform, website, APIs, and related services (collectively, the “Platform”).

MediVault operates in the United States (primary headquarters) and the European Union (engineering and EU client operations in Berlin, Germany). This Policy is designed to meet our obligations under:

- The **Health Insurance Portability and Accountability Act (HIPAA)** and the HITECH Act
- The EU/UK **General Data Protection Regulation (GDPR)**
- The **California Consumer Privacy Act (CCPA)** as amended by the CPRA
- Applicable state medical records laws

Where requirements conflict, we apply the more protective standard.

## 2. Who We Are — Data Controller and DPO

**U.S. Operations**
MediVault, Inc.
[Mailing Address]
HIPAA Privacy Officer: [EMAIL]
HIPAA Security Officer: [EMAIL]

**EU Operations**
MediVault GmbH (Berlin)
[EU Mailing Address]
Data Protection Officer (DPO): [EMAIL]
EU Representative: MediVault GmbH acts as our EU representative for GDPR purposes.

Under GDPR, MediVault Inc. and MediVault GmbH are joint controllers for the purposes of cross-border data processing between our US and EU operations. The joint controller arrangement is documented in our Records of Processing Activities and is available upon request.

## 3. Information We Collect

We collect three categories of information:

### 3.1 Information You Provide

**For healthcare providers and administrators:**
- Full name, professional credentials, and National Provider Identifier (NPI)
- Email address, phone number, and mailing address
- Organization name, address, and Tax ID / EIN
- Payment and billing information
- Account credentials

**For patients (where applicable):**
- Name, date of birth, and contact information
- Medical record numbers and insurance identifiers
- Clinical notes, diagnoses, medications, and treatment plans
- Billing and insurance information

### 3.2 Information Generated by the Platform

- Access logs: who accessed which records, when, and from which IP address (required by HIPAA)
- Audit trails: all create, read, update, and delete operations on patient records
- Device and session data: browser type, operating system, and session identifiers
- Usage analytics: feature usage patterns (de-identified and aggregated)

### 3.3 Information from Third Parties

- Electronic Health Records (EHR) imported from integrated systems via HL7 FHIR APIs
- Insurance eligibility and claims data from clearinghouses
- Identity verification results from third-party providers
- Laboratory results from integrated lab information systems

## 4. Legal Basis for Processing (GDPR)

For EU residents, we process personal data on the following legal bases under GDPR Articles 6 and 9:

| Processing Activity | Legal Basis |
|---|---|
| Providing the Platform to providers | Article 6(1)(b) — Performance of a contract |
| Processing patient PHI for treatment | Article 9(2)(h) — Healthcare provision |
| Security monitoring and audit logging | Article 6(1)(c) — Legal obligation (GDPR Art. 32; HIPAA) |
| Platform improvement analytics | Article 6(1)(f) — Legitimate interests (using de-identified data only) |
| Marketing communications | Article 6(1)(a) — Consent (opt-in only) |
| Compliance with legal obligations | Article 6(1)(c) — Legal obligation |
| Research and public health | Article 9(2)(j) — Research / public health (de-identified data only) |

Where we rely on legitimate interests, you may object to this processing at any time (see Section 14).

## 5. Protected Health Information (PHI) and HIPAA

### 5.1 What Is PHI

Under HIPAA, “Protected Health Information” (PHI) means any individually identifiable health information we create, receive, maintain, or transmit in electronic, paper, or oral form. PHI includes names, dates, geographic data, phone numbers, account numbers, biometric identifiers, medical record numbers, and health or treatment information linked to a specific individual.

### 5.2 Business Associate Agreements

MediVault is a Business Associate under HIPAA. When we process PHI on behalf of a Covered Entity (a healthcare provider or health plan), we do so under a **Business Associate Agreement (BAA)**. The BAA governs:

- Permitted uses and disclosures of PHI
- Our obligation to implement HIPAA-required safeguards
- Our obligation to report breaches and security incidents
- Requirements on our subcontractors who access PHI

We will not process PHI for a Covered Entity without a fully executed BAA in place.

### 5.3 Minimum Necessary Standard

We apply HIPAA’s minimum necessary standard to all PHI access. Our role-based access control system enforces this: each user account is configured with the minimum permissions required for their specific job function. Access to PHI is logged and reviewed quarterly.

### 5.4 Patient Rights Under HIPAA

If you are a patient whose PHI is stored on MediVault, you have the following rights, exercisable through the healthcare provider who is your Covered Entity:

- **Right to Access:** Receive a copy of your health records, typically within 30 days.
- **Right to Amend:** Request corrections to inaccurate or incomplete records.
- **Right to Accounting of Disclosures:** Request a list of who we have disclosed your PHI to, other than for treatment, payment, or healthcare operations.
- **Right to Request Restrictions:** Ask your provider to limit how they use or disclose your PHI.
- **Right to Confidential Communications:** Request that your provider communicate with you in a specific way or at a specific location.
- **Right to Breach Notification:** Be informed if your PHI is involved in a reportable breach.

## 6. Data De-identification Methodology

MediVault de-identifies patient data for platform analytics, performance improvement, and research. We use the **HIPAA Safe Harbor method** (45 CFR § 164.514(b)(2)), which requires removal of all 18 categories of identifiers specified by HHS, including:

Names — Geographic subdivisions smaller than state — Dates (except year) — Phone numbers — Fax numbers — Email addresses — Social Security numbers — Medical record numbers — Health plan beneficiary numbers — Account numbers — Certificate/license numbers — VINs — IP addresses — Device identifiers — Web URLs — Biometric identifiers — Full-face photographs — Any unique identifying number or code

Once de-identified, data is no longer PHI and is not subject to HIPAA restrictions. We use de-identified data for:

- Platform performance monitoring and improvement
- Aggregate benchmarking reports provided to providers
- Clinical research (shared under data use agreements only)

**Re-identification prohibition.** MediVault does not attempt to re-identify de-identified data, and our agreements with research partners include explicit re-identification prohibitions.

**Periodic risk assessments.** We conduct annual re-identification risk assessments to verify that our de-identification processes remain effective as the size and composition of our data corpus changes.

## 7. How We Use Your Information

We use the information we collect for the following purposes:

**Platform operations:** Providing, maintaining, and improving the MediVault platform, including processing and storing patient records, managing user accounts, and enabling integrations.

**Security and compliance:** Maintaining HIPAA-required audit logs, detecting unauthorized access, responding to security incidents, and meeting our legal obligations.

**Analytics and improvement:** Using de-identified and aggregated data to understand how the platform is used, identify bugs and performance issues, and develop new features.

**Communications:** Sending administrative messages (account notices, security alerts, policy updates) and, with consent, marketing communications.

**Legal purposes:** Responding to legal process, enforcing our agreements, and protecting our rights and the rights of users.

We do not use PHI to market products or services to patients. We do not sell PHI or personal data.

## 8. Cookies and Tracking Technologies

The MediVault platform uses the following types of cookies and tracking technologies:

| Type | Purpose | Storage Period |
|---|---|---|
| Session cookies | Authentication and session management | Session only |
| Security cookies | CSRF protection, bot detection | 24 hours |
| Preference cookies | UI settings, language preferences | 12 months |
| Analytics cookies | De-identified usage analytics | 13 months |

We do not use advertising cookies or behavioral tracking cookies.

**EU users:** We obtain consent for non-essential cookies via our cookie consent mechanism. You may withdraw consent at any time through our cookie settings page.

**All users:** You can control cookies through your browser settings. Disabling session and security cookies will prevent you from logging into the platform.

## 9. How We Share Your Information

**We do not sell your personal information or PHI.** We do not share PHI with advertisers, data brokers, or non-healthcare third parties.

We may share your information in the following circumstances:

### 9.1 Healthcare Operations

We share PHI with other healthcare providers for treatment purposes, and with health plans for payment purposes, as permitted by HIPAA without additional consent.

### 9.2 Service Providers

We share data with service providers who help us operate the platform. All service providers with access to PHI are required to execute BAAs. All service providers with access to EU personal data are required to execute Data Processing Agreements and Standard Contractual Clauses where applicable.

Our key service providers include: cloud infrastructure (US-based, HIPAA-compliant), email delivery, payment processing, identity verification, and customer support software. A complete list of service providers with access to personal data is available on request.

### 9.3 Legal Obligations

We may disclose information as required by applicable law, court order, subpoena, or government request. We will notify you of any such request to the extent legally permitted.

### 9.4 Public Health and Safety

HIPAA permits us to disclose PHI without authorization for public health activities (e.g., disease surveillance), required reports to government authorities (e.g., mandated reporting of abuse), and to avert a serious threat to health or safety.

### 9.5 Business Transfers

If MediVault is acquired, merged, or undergoes a change of control, your information may be transferred to the successor entity. We will notify you before your information becomes subject to a materially different privacy policy.

## 10. International Data Transfers

MediVault transfers personal data between the United States and the European Union. The legal mechanisms governing these transfers are:

**EU → US transfers:** Governed by Standard Contractual Clauses (SCCs) as approved by the European Commission (Decision 2021/914). We have implemented the following supplementary technical measures:
- AES-256 encryption at rest for all PHI and personal data
- TLS 1.3 encryption for all data in transit
- Pseudonymization of patient identifiers before transfer wherever clinically feasible
- Role-based access controls limiting US-side access to authorized personnel with documented need
- Data access logs reviewed by our EU Data Protection Officer quarterly

**US → EU transfers:** Data flows from US operations to our Berlin engineering team are governed by the same SCC framework and supplementary measures. Our Berlin team processes data solely for platform development, security, and EU client support purposes.

All cross-border data flows are documented in our **Records of Processing Activities (RoPA)**, maintained pursuant to GDPR Article 30. A summary of the RoPA is available to EU data subjects on request.

## 11. Data Retention Schedule

We retain different categories of data for different periods, based on legal requirements and operational necessity:

| Data Category | Retention Period | Basis |
|---|---|---|
| Account data (providers/admins) | Duration of account + 90 days post-closure | Contractual |
| Patient medical records | Per applicable state law (typically 7–10 years from last treatment; 10 years for pediatric records until the patient reaches 21) | State medical records laws |
| HIPAA Privacy Rule records | 6 years from creation, or 6 years from date last in effect | 45 CFR § 164.530(j) |
| HIPAA Security Rule records | 6 years from creation | 45 CFR § 164.316(b) |
| Audit logs | 6 years | HIPAA + GDPR Art. 5(2) |
| Security incident records | 6 years | HIPAA |
| BAAs | Duration of relationship + 6 years | HIPAA |
| EU personal data | See corresponding category above, subject to shorter GDPR retention where applicable | GDPR Art. 5(1)(e) |
| De-identified analytics data | Indefinite (not subject to deletion requests) | Not PHI; not personal data |
| Marketing consent records | Duration of consent + 3 years | GDPR accountability |

When data reaches the end of its retention period, we delete it using NIST SP 800-88 media sanitization guidelines.

## 12. Data Security

We implement administrative, technical, and physical safeguards as required by the HIPAA Security Rule (45 CFR Part 164, Subpart C) and GDPR Article 32. Our security program includes:

**Encryption:** AES-256 encryption at rest for all PHI and personal data. TLS 1.3 for all data in transit. Encrypted backups stored in geographically separate facilities.

**Access controls:** Multi-factor authentication required for all user accounts. Role-based access controls (RBAC) enforcing minimum necessary access. Privileged access management for administrative functions. Access reviews conducted quarterly.

**Monitoring and audit:** Real-time security monitoring with automated alerts. HIPAA-required audit logs for all PHI access and modification. Annual third-party penetration testing. Quarterly vulnerability scans. SOC 2 Type II audit conducted annually.

**Physical security:** Data stored in HIPAA-compliant, SOC 2-certified data centers with physical access controls, environmental controls, and 24/7 monitoring.

**Workforce:** Annual HIPAA training for all staff with access to PHI. Background checks for employees and contractors with PHI access. Confidentiality agreements for all workforce members.

**Incident response:** Written incident response plan tested annually. Dedicated security response team. Documented breach assessment procedures.

No security system is impenetrable. If you believe your account has been compromised, contact us immediately at [EMAIL].

## 13. Breach Notification

MediVault operates a dual-track breach notification process designed for our US-EU operational structure.

### 13.1 Internal Escalation (All Breaches)

Any potential breach or security incident, regardless of where discovered, must be reported to our Security Response Team within **24 hours** of discovery. The Security Response Team immediately notifies both the HIPAA Security Officer and the EU Data Protection Officer, activating parallel assessment tracks.

### 13.2 GDPR Track (EU Personal Data)

If a breach involves EU residents’ personal data:

- We notify the relevant EU supervisory authority **within 72 hours** of becoming aware of the breach (GDPR Article 33).
- We notify affected EU individuals **without undue delay** if the breach is likely to result in a high risk to their rights and freedoms (GDPR Article 34).
- The notification will include: the nature of the breach, categories and approximate number of affected individuals, contact details of the DPO, likely consequences, and measures taken or proposed.

If we cannot complete the full investigation within 72 hours, we provide an initial notification with a commitment to supplement it.

### 13.3 HIPAA Track (PHI)

If a breach involves unsecured PHI:

- We notify **affected individuals within 60 days** of discovery of the breach (45 CFR § 164.404).
- For breaches affecting **500 or more individuals** in a state or jurisdiction, we also notify **prominent media outlets** in that state/jurisdiction within 60 days.
- All reportable breaches are submitted to the **HHS Secretary** (via the HHS Breach Reporting Portal) no later than 60 days after discovery. Breaches affecting fewer than 500 individuals are reported annually.
- The HIPAA breach notice will include: what happened, the types of information involved, steps individuals can take to protect themselves, what we are doing to investigate and address the breach, and contact information.

### 13.4 Breach Assessment

We treat all potential breaches with full seriousness. Our breach risk assessment follows the four-factor test under HIPAA: nature and extent of PHI involved, who accessed or could have accessed it, whether the PHI was actually acquired or viewed, and extent to which risk has been mitigated.

## 14. Your Privacy Rights

The rights available to you depend on where you live and which law applies to your data.

### 14.1 Rights Under GDPR (EU Residents)

If you are located in the European Union, you have the following rights under GDPR:

**Right of Access (Article 15).** You have the right to obtain confirmation of whether we process your personal data, and if so, a copy of that data along with information about how it is processed.

**Right to Rectification (Article 16).** You have the right to have inaccurate personal data corrected without undue delay.

**Right to Erasure (“Right to be Forgotten”) (Article 17).** You have the right to request deletion of your personal data where: it is no longer necessary for the purposes for which it was collected; you withdraw consent and there is no other legal basis; you object to processing based on legitimate interests and there are no overriding legitimate grounds; the data has been unlawfully processed; or deletion is required by law. This right does not apply where we are required to retain data by HIPAA or other legal obligations.

**Right to Restriction of Processing (Article 18).** You have the right to request that we restrict how we use your data in certain circumstances.

**Right to Data Portability (Article 20).** You have the right to receive your personal data in a structured, commonly used, machine-readable format, and to transmit that data to another controller where technically feasible.

**Right to Object (Article 21).** You have the right to object to processing based on legitimate interests. You also have an unconditional right to object to processing for direct marketing purposes.

**Rights Related to Automated Decision-Making (Article 22).** You have the right not to be subject to decisions based solely on automated processing that significantly affect you. MediVault does not make significant automated decisions about individuals without human review.

**Right to Lodge a Complaint.** You have the right to lodge a complaint with your local supervisory authority. A list of EU supervisory authorities is available at https://edpb.europa.eu/about-edpb/board/members.

To exercise your GDPR rights, contact our DPO at [EMAIL]. We will respond within one month (extendable by two months for complex requests).

### 14.2 Rights Under HIPAA (Patients)

See Section 5.4 for a full description of HIPAA patient rights. To exercise these rights, contact the healthcare provider who is your Covered Entity. MediVault can assist providers in facilitating these requests.

### 14.3 Marketing Opt-Out (All Users)

You may opt out of marketing communications at any time by clicking “unsubscribe” in any marketing email, or by contacting us at [EMAIL]. Opting out of marketing does not affect administrative or service-related communications.

## 15. California Residents (CCPA/CPRA)

If you are a California resident, you have the following rights under the California Consumer Privacy Act (as amended by the CPRA):

**Right to Know.** You have the right to request information about the categories and specific pieces of personal information we collect, the sources from which we collect it, the business or commercial purpose for collecting it, and the categories of third parties we share it with.

**Right to Delete.** You have the right to request deletion of personal information we have collected, subject to certain exceptions (including our legal retention obligations under HIPAA).

**Right to Correct.** You have the right to request correction of inaccurate personal information.

**Right to Opt Out of Sale or Sharing.** We do not sell personal information, and we do not share personal information for cross-context behavioral advertising. No opt-out is needed, but you can confirm this by contacting us at [EMAIL].

**Right to Limit Use of Sensitive Personal Information.** We use sensitive personal information (including health information) only for the purposes necessary to provide our services. We do not use it for any secondary purposes that would trigger CPRA opt-out rights.

**Non-Discrimination.** We will not discriminate against you for exercising your CCPA/CPRA rights.

To exercise these rights, contact us at [EMAIL] or call [PHONE NUMBER]. We will verify your identity before processing requests. We will respond within 45 days (extendable by an additional 45 days where reasonably necessary).

## 16. Children’s Privacy

MediVault does not knowingly collect personal information from children under 13 through direct sign-up. Our platform is designed for use by licensed healthcare providers, not by patients directly.

Patient records for minors are managed by healthcare providers as Covered Entities under HIPAA. Parental or guardian consent for minor patients is the responsibility of the Covered Entity. MediVault processes PHI for minor patients solely as a Business Associate under the provider’s direction.

If you believe we have inadvertently collected personal information from a child under 13 outside of the healthcare context, please contact us at [EMAIL] and we will delete it promptly.

## 17. Changes to This Policy

We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors.

**Material changes** (changes that significantly affect how we process your personal data or that affect your rights) will be communicated to you at least **30 days** before they take effect, via email and/or prominent notice on the Platform.

**For EU residents:** Where a material change affects processing based on consent, we will request fresh consent before the change takes effect.

The updated Policy will be posted at [LINK]. The “Last Updated” date at the top of this Policy indicates when it was last revised. Your continued use of the Platform after the effective date of a change constitutes your acceptance of the updated Policy.

## 18. Contact Us

If you have questions about this Privacy Policy, our privacy practices, or your rights, please contact us:

**HIPAA Privacy Officer**
MediVault, Inc.
Email: [EMAIL]
Phone: [PHONE NUMBER]
Mailing Address: [Mailing Address]

**Data Protection Officer (GDPR)**
MediVault GmbH (Berlin)
Email: [EMAIL]
Mailing Address: [EU Mailing Address]

**For EU residents:** You may also contact us in the language of your EU member state. Responses will be provided in the language of your request where feasible.

---

*This Privacy Policy was last updated on [Effective Date].*

---

*Prepared by Lavern — Multi-Agent Legal Design System*
*This document was produced with AI assistance and reviewed by multi-agent verification. It does not constitute legal advice. For HIPAA compliance, EU regulatory filings, or any matter involving binding legal obligations, please verify with qualified legal professionals.*
`;function it(o){return{sessionId:o,status:"Complete",documentTitle:"Cloud MSA — Negotiation Briefing",executiveSummary:"A negotiation briefing and set of redlined clauses has been prepared for a Cloud Master Services Agreement. The unlimited liability clause in §8.3 is a show-stopper — the agreement as drafted would expose the client to consequential damages with no ceiling. The indemnification clause in §12 uses “arising in connection with” language broad enough to shift the vendor’s own product liability to the client. The SLA termination right has no cure period, creating a hair-trigger termination mechanism that vendors will not accept and courts may not enforce. All three issues are standard commercial negotiating points. Friday signing is achievable if redlines are sent today. Cost: $5.14 of $10.00 budget.",keyChanges:[{title:"⛔ Liability — Unlimited Exposure",before:"Section 8.3 contained no limitation of liability. Either party could be held liable for all damages — including consequential, indirect, and punitive damages — with no ceiling.",after:"Mutual exclusion of consequential damages. Aggregate liability capped at 12 months’ fees. Carve-outs for IP indemnity, death/personal injury, fraud, and confidentiality breach — matching market standard."},{title:"⛔ Indemnity — Overbroad Trigger",before:"Section 12 required client to indemnify vendor for any third-party claim “arising in connection with” client’s use of the service. This language is broad enough to cover claims arising from the vendor’s own product defects.",after:"Client indemnity narrowed to: (a) wilful misconduct or gross negligence; (b) breach of data use restrictions; (c) uploaded content infringing third-party IP. Vendor indemnity added for IP infringement by the service itself. Bilateral structure now mirrors market standard."},{title:"⚠️ SLA — No Cure Period",before:"Section 14.2 allowed termination for cause after any single month below the uptime SLA target. No cure period, no minimum failure threshold. Hair-trigger termination right that vendors will resist at contract review.",after:"Termination right now requires three consecutive months below target, or four in any rolling 12-month period. 30-day written cure notice required before terminating. Service credit schedule added for failures that don’t reach the termination threshold."}],dimensions:[{dimension:"Liability Protection",before:.5,after:4.2,delta:3.7},{dimension:"Indemnity Balance",before:.8,after:4,delta:3.2},{dimension:"SLA Enforceability",before:1.5,after:3.8,delta:2.3},{dimension:"Negotiation Readiness",before:1,after:4.3,delta:3.3},{dimension:"Market Alignment",before:1.2,after:4.1,delta:2.9}],finalOutput:nt,debateResolutions:[{topic:"Liability cap amount — 12 months vs. 24 months",resolution:"12-month cap adopted as opening position; 24 months designated as concession. Market standard survey confirmed 12 months is the median for SaaS agreements of this value. 24 months offered as fallback preserves negotiating room without materially increasing risk.",winningPosition:"Commercial Counsel’s 12-month opening position prevailed over Risk Assessor’s preference for 24 months. The Risk Assessor’s argument was valid but tactically weaker — opening at 24 months signals willingness to accept higher exposure.",evidenceWeight:"Bonterms Cloud Services Agreement (2023 benchmark), LegalSifter commercial contract dataset (n=1,240): 12-month cap in 68% of SaaS agreements, 24-month in 19%, unlimited in 13%.",escalationNeeded:!1,confidence:.91},{topic:"Indemnity trigger language — “arising in connection with” vs. enumerated triggers",resolution:"Enumerated triggers adopted. “Arising in connection with” replaced with specific list: wilful misconduct, data use breach, uploaded IP infringement. Bilateral structure added so vendor also indemnifies client for service IP claims.",winningPosition:"Liability Specialist’s enumerated-triggers approach prevailed over Contract Specialist’s argument that “arising in connection with” is industry standard. Both positions were legally valid; the decision turned on risk allocation preference for a buyer-side client.",evidenceWeight:"Three appellate decisions cited where “arising in connection with” was applied to shift vendor product-defect liability to customer. Buyer-side risk allocation is the appropriate default for this engagement.",escalationNeeded:!1,confidence:.93}],gateDecisions:[{gateType:"ethics critical",decision:"approve",summary:"Two RED findings (unlimited liability, overbroad indemnity) and one HIGH finding (SLA cure period) approved for redline. Client must be informed that signing without these changes is not recommended."},{gateType:"final delivery",decision:"approve",summary:"Negotiation briefing and redlined clauses verified. Liability cap analysis, indemnity restructure, and SLA cure period all validated against market benchmarks."}],verificationChecks:[{type:"liability-analysis",passed:!0,label:"Liability Cap Market Benchmark",score:.91},{type:"indemnity-structure",passed:!0,label:"Indemnity Bilateral Structure",score:.93},{type:"sla-enforceability",passed:!0,label:"SLA Enforceability",score:.88},{type:"legal-accuracy",passed:!0,label:"Legal Accuracy",score:.94}],narrative:[{phase:"Analysis",heading:"Five specialists review a cloud MSA under Friday deadline",body:"The engagement opened with a Friday signing deadline and three red flags identified within the first pass. Commercial Counsel spotted the unlimited liability clause immediately: Section 8.3 contained no cap whatsoever, exposing the client to unlimited consequential damages. Liability Specialist flagged the indemnity language in Section 12 — “arising in connection with” is one of the broadest possible triggers, and three appellate decisions were on file where the same language shifted vendor product-defect liability to the customer. The Contract Specialist noted the SLA clause had no cure period, creating a theoretical hair-trigger termination right that would likely produce resistance from the vendor rather than acceptance.",agents:["Commercial Counsel","Liability Specialist","Contract Specialist","Risk Assessor","Synthesis Editor"]},{phase:"Debate",heading:"The cap amount debate — 12 months or 24?",body:"The first debate turned on strategy, not law. Risk Assessor argued for a 24-month liability cap as the opening position: start higher, leave room to negotiate down to 12. Commercial Counsel countered that opening at 24 months signals willingness to accept above-market exposure — the vendor’s lawyers would read it as inexperience. Market data supported Commercial Counsel: 68% of comparable SaaS agreements use a 12-month cap. The debate resolved in favor of the 12-month opening, with 24 months designated as the concession if the vendor pushes back. A tactical choice, not a legal one.",agents:["Commercial Counsel","Risk Assessor"],highlight:"This debate illustrates the difference between legal risk and negotiation strategy. The agents worked through both dimensions rather than treating them as the same question."},{phase:"Ethics Gate",heading:"Signing advisory",body:"The ethics gate was triggered by the unlimited liability finding. The system flagged that delivering a work product without an explicit client advisory — “do not sign this as written” — would be inconsistent with the firm’s duty of candor. The negotiation briefing was structured accordingly: the bottom-line recommendation appears in a call-out box before any analysis, not buried in a section.",agents:[],highlight:"The brief leads with the recommendation, not the analysis. Clients under time pressure need to know what to do before they read why."},{phase:"Drafting",heading:"Redlining three clauses in parallel",body:"Liability Specialist drafted the Section 8 replacement, inserting the mutual consequential damages exclusion and the 12-month aggregate cap with standard carve-outs. Contract Specialist restructured Section 12 into bilateral form: vendor indemnifies client for service IP claims; client indemnifies vendor for the three enumerated triggers only. The SLA clause was the most technically involved — the cure period, the three-consecutive-month threshold, the four-in-twelve alternative, and the service credit schedule all needed to interlock cleanly.",agents:["Liability Specialist","Contract Specialist"]},{phase:"Verification",heading:"Market benchmark and legal accuracy checks",body:"Four verification checks ran: liability cap market benchmark (12-month cap confirmed as market standard for this contract value band), indemnity bilateral structure (confirmed symmetrical, no hidden one-sidedness in the carve-outs), SLA enforceability (cure period and threshold verified against case law on termination-for-cause requirements), and overall legal accuracy. All four passed.",agents:[]},{phase:"Delivery",heading:"Ready to send",body:"The negotiation briefing leads with the bottom-line recommendation and framing language the client can use with the vendor. The redlined clauses follow in Part II. The signing checklist closes with four steps the client should complete before Friday. All work product is ready for client review and, if appropriate, independent counsel sign-off.",agents:[]}],debate:{findingsCount:6,challengesCount:2,resolutionsCount:2,unresolvedCount:0},verification:{resultsCount:4,passed:4,failed:0,confidence:.92,breakdown:[{type:"self",passed:!0,confidence:.91,label:"Liability Benchmark"},{type:"cross",passed:!0,confidence:.93,label:"Indemnity Structure"},{type:"score",passed:!0,confidence:.94,label:"Legal Accuracy"}]},cost:{accumulated:5.14,budget:10,remaining:4.86},agentPerformance:[{name:"Commercial Counsel",role:"commercial-counsel",findingsPosted:2,challengesSurvived:1,avgConfidence:.91},{name:"Liability Specialist",role:"liability-specialist",findingsPosted:2,challengesSurvived:0,avgConfidence:.93},{name:"Contract Specialist",role:"contract-specialist",findingsPosted:1,challengesSurvived:0,avgConfidence:.88},{name:"Risk Assessor",role:"risk-assessor",findingsPosted:1,challengesSurvived:0,avgConfidence:.89},{name:"Synthesis Editor",role:"synthesis-editor",findingsPosted:0,challengesSurvived:0,avgConfidence:0}],eventCount:52,limitations:{flaggedForHumanReview:["Governing law and jurisdiction clause not reviewed — verify against client’s entity structure","Data processing addendum (DPA) not in scope — review separately before signing","Payment and renewal terms not reviewed in this engagement"],confidenceIntervals:"",disclaimer:"This briefing was produced by an AI system with multi-agent verification. It does not constitute legal advice. For a commercial agreement of this significance, we recommend independent counsel review before signing."},nextSteps:[{label:"Send redlines today",description:"Email the three redlined clauses to the vendor’s counsel with the suggested cover language from the briefing. The vendor needs time to review before Friday.",kind:"action"},{label:"Do not accept “fix it in an amendment”",description:"If the vendor suggests deferring the liability cap or indemnity fix to a side letter or amendment, decline. Amendment obligations are frequently not fulfilled. Core commercial terms must be in the base agreement.",kind:"watchout"},{label:"Confirm SLA measurement methodology",description:"Before signing, confirm how uptime is measured (vendor-reported vs. independent monitoring), what counts as scheduled maintenance, and how disputes about SLA calculations are resolved.",kind:"action"},{label:"Review the data processing addendum",description:"The DPA was not in scope for this engagement. If the service processes personal data, the DPA must be reviewed for GDPR and CCPA compliance before signing.",kind:"watchout"},{label:"Schedule post-signing review",description:"Set a calendar reminder to review SLA performance at the 90-day mark. If the vendor misses the uptime target in the first month, document it immediately — you’ll need the record if the three-consecutive-month threshold is ever reached.",kind:"schedule"}]}}const nt=`# Cloud MSA — Negotiation Briefing

**DRAFT — For Client Review**  ·  *Commercial contract review by Lavern*
*Prepared: [Date]*  ·  *Signing deadline: Friday*  ·  *Priority: Critical*

---

| Issue | Section | Severity | Status |
|-------|---------|----------|--------|
| Unlimited liability — no cap defined | §8.3 | **CRITICAL** | Redlined |
| Indemnity scope — overbroad trigger | §12 | **CRITICAL** | Redlined |
| SLA termination — no cure period | §14.2 | **HIGH** | Redlined |

> **Bottom line:** Do not sign §8.3 or §12 as written. The unlimited liability exposure in §8.3 is a show-stopper — the vendor could hold you liable for consequential damages with no ceiling. Section 12 uses “arising in connection with” language broad enough to shift the vendor’s own product liability to you. Both are standard negotiating points that well-counseled buyers raise routinely. Friday is achievable if you send the redlines today.

---

## Part I — Negotiation Brief

### 1. Recommended Opening Position

Send the vendor all three redlines simultaneously. Frame them as standard commercial positions, not as objections to the deal. The framing matters: buyers who raise these points routinely get them accepted, especially when they signal they are otherwise ready to sign.

**Suggested cover language:**
> “We’re ready to move forward. Three commercial points to resolve first. These are standard buyer positions and we’re happy to discuss alternatives that work for both sides.”

### 2. Issue-by-Issue Analysis

#### Issue 1: §8.3 — Unlimited Liability

**What the clause says (paraphrased):** Each party is liable for all damages arising from breach of this agreement, with no limitation.

**Why this is a show-stopper:** A SaaS vendor serving many customers is a prime target for consequential damage claims — data loss, business interruption, downstream customer losses. Without a cap, a single incident could expose you to liability that dwarfs the value of the contract. More importantly, the lack of a cap makes this agreement difficult to insure: cyber liability and E&O policies routinely exclude uncapped indemnity obligations.

**Our position:** A mutual liability cap at 12 months of fees paid in the preceding 12 months. This is the market standard — present in 68% of comparable SaaS agreements. If the vendor pushes back, offer 24 months as a concession.

**Carve-outs we accept (on both sides):** Death or personal injury; fraud or wilful misconduct; breach of confidentiality; IP infringement indemnity obligations.

#### Issue 2: §12 — Indemnification Scope

**What the clause says (paraphrased):** You will defend, indemnify, and hold harmless the vendor from any third-party claim “arising in connection with” your use of the service.

**Why this is dangerous:** Three appellate decisions are on file where identical language was applied to shift vendor product-defect liability to the customer. The plaintiff only needed to show a causal connection between the customer’s use and their injury — the vendor’s underlying product failure was treated as irrelevant to the indemnity obligation. You cannot accept this.

**Our position:** Narrow the trigger to three specific situations: (a) your wilful misconduct or gross negligence; (b) your breach of the data use restrictions; (c) content you upload that infringes a third party’s IP. Add a vendor indemnity for IP infringement by the service itself. This bilateral structure is standard.

#### Issue 3: §14.2 — SLA Termination Rights

**What the clause says (paraphrased):** If the vendor fails to meet monthly uptime targets, you may terminate with notice.

**What’s missing:** No cure period. No minimum failure threshold. As drafted, a single month below target — even by 0.1% — technically triggers termination. Vendors will resist this at review and may walk away from a deal over it, even though the underlying issue is easy to fix.

**Our position:** Three consecutive months below the SLA target (or four in any rolling 12-month period) triggers a 30-day written cure notice. If the vendor achieves the uptime target during the cure period, the termination right for that period is waived. Service credits apply for failures that don’t meet the termination threshold.

---

## Part II — Redlined Clauses

The following are our proposed replacement clauses.

### Section 8 — Limitation of Liability [REVISED]

**8.1 Mutual Exclusion of Consequential Damages**

Neither party shall be liable to the other for any indirect, incidental, special, exemplary, punitive, or consequential damages, including loss of revenue, loss of profits, loss of business, loss of data, or loss of goodwill, arising out of or related to this Agreement, even if such party has been advised of the possibility of such damages.

**8.2 Aggregate Liability Cap**

The aggregate liability of each party to the other for any and all claims arising out of or related to this Agreement shall not exceed the total fees paid or payable by Customer to Vendor in the twelve (12) calendar months immediately preceding the event giving rise to the claim.

**8.3 Exceptions**

The limitations in Sections 8.1 and 8.2 shall not apply to:

- **(a)** Either party’s indemnification obligations under Section 12 for third-party IP infringement claims;
- **(b)** Damages arising from death or personal injury caused by a party’s negligence or wilful act;
- **(c)** Fraud or wilful misconduct by either party;
- **(d)** Either party’s material breach of the confidentiality obligations in Section 9.

---

### Section 12 — Indemnification [REVISED]

**12.1 Vendor Indemnification**

Vendor will defend, indemnify, and hold Customer harmless from and against any third-party claim, suit, or proceeding alleging that the Service, as provided by Vendor and used in accordance with this Agreement, infringes or misappropriates any patent, copyright, trademark, or trade secret of a third party. This obligation does not apply to claims arising from: (a) Customer’s modification of the Service; (b) combination of the Service with third-party products not provided or approved by Vendor; or (c) Customer’s use of the Service in violation of this Agreement.

**12.2 Customer Indemnification**

Customer will defend, indemnify, and hold Vendor harmless from and against any third-party claim, suit, or proceeding to the extent arising from:

- **(a)** Customer’s wilful misconduct or gross negligence in connection with the use of the Service;
- **(b)** Customer’s material breach of the data use restrictions in Section 6 of this Agreement; or
- **(c)** Content uploaded by Customer that infringes or misappropriates a third party’s intellectual property rights.

For the avoidance of doubt, Customer’s indemnification obligation under this Section does not extend to claims arising from defects in the Service, Vendor’s product design decisions, or Vendor’s own acts or omissions.

**12.3 Procedure**

The indemnifying party’s obligations are conditioned on the indemnified party: (a) providing prompt written notice of the claim; (b) granting the indemnifying party sole control of the defense and settlement (provided that no settlement may impose liability on the indemnified party without its prior written consent); and (c) providing reasonable cooperation at the indemnifying party’s expense.

---

### Section 14 — Service Level Agreement [REVISED]

**14.1 Uptime Commitment**

Vendor commits to a monthly uptime of 99.5% for the core Service features, measured on a calendar month basis and excluding: (a) scheduled maintenance windows communicated at least 72 hours in advance; (b) downtime caused by Customer’s acts or omissions; and (c) force majeure events.

**14.2 Service Credits**

If Vendor fails to achieve the monthly uptime commitment, Vendor will apply the following credits to Customer’s next invoice:

| Monthly Uptime Achieved | Credit (% of Monthly Fee) |
|------------------------|--------------------------|
| 99.0% – 99.4% | 10% |
| 95.0% – 98.9% | 25% |
| Below 95.0% | 50% |

Service credits are Customer’s sole remedy for SLA failures that do not reach the termination threshold in Section 14.3.

**14.3 Termination Right**

Customer may terminate this Agreement for cause, with no early termination fee and with a pro-rata refund of any prepaid fees for the unused portion of any prepaid term, if:

- Vendor fails to meet the uptime commitment in **three (3) consecutive calendar months**; or
- Vendor fails to meet the uptime commitment in **four (4) or more calendar months** within any rolling 12-month period.

**Cure Period.** Before exercising the termination right, Customer must provide Vendor with written notice of its intent to terminate and a 30-day opportunity to cure. If Vendor achieves the monthly uptime commitment during the entire 30-day cure period, the termination right arising from the failures described in the notice is waived for that notice period (but not for future failures).

---

## Part III — Signing Checklist

Before signing:

1. **Send the three redlines today.** The vendor needs time to review. Even if they push back, opening the negotiation signals you are commercially prepared.
2. **Do not accept “we’ll fix it in an amendment.”** Core commercial terms must be in the base agreement. Side-letter commitments are routinely not fulfilled.
3. **Confirm SLA measurement methodology.** The agreement should specify whether uptime is measured by vendor-reported telemetry or independent monitoring, and how measurement disputes are resolved.
4. **Review the data processing addendum separately.** The DPA was not in scope for this engagement. If the service processes personal data, the DPA requires separate review for GDPR/CCPA compliance.

---

*Prepared by Lavern — Multi-Agent Legal Design System*
*This briefing does not constitute legal advice. For a commercial agreement of this significance, we recommend independent counsel review before signing.*
`;function ot(o){return{sessionId:o,status:"Complete",documentTitle:"CodeCraft Developer Services Agreement",executiveSummary:"A revised Developer Services Agreement has been drafted for CodeCraft, addressing critical IP ownership gaps and worker misclassification risks. Six specialists collaborated across IP, employment, contract, plain language, risk pricing, and synthesis. The most critical finding: the original agreement relied on work-for-hire doctrine, which is legally ineffective for independent contractor software under 17 USC 101. A narrowly-scoped IP assignment clause with pre-existing IP carve-outs was designed to prevent future ownership disputes while preserving contractor independence. Cost: $4.22 of $10.00 budget.",keyChanges:[{title:"⛔ IP Ownership — Work-for-Hire Gap",before:'Agreement relied solely on "work made for hire" doctrine, which does not apply to software created by independent contractors under copyright law.',after:'Dual protection: work-for-hire clause retained as backup, plus explicit assignment of "Deliverable Work Product" (code committed to company repos for company projects). Pre-existing IP schedule preserves contractor rights.'},{title:"⚠️ Classification — Misclassification Risk",before:"Contract required exclusive engagement, fixed 9-5 hours, and company equipment — three factors indicating employee status under California ABC test.",after:"Removed exclusivity requirement, replaced fixed hours with deliverable deadlines, and made company equipment optional. Added safe harbor provisions and independent contractor acknowledgment."},{title:"⚠️ Termination — One-Sided Provisions",before:"Company could terminate with 7 days notice; contractor required 30 days. No code handover, credential transfer, or transition provisions.",after:"Balanced 14-day notice for both parties. Mandatory 5-business-day code review and handover period. PR completion required before final termination. Credential rotation checklist."},{title:"⚠️ Liability — Insufficient Cap",before:"Liability capped at fees paid in prior 12 months with no carve-outs. For a new contractor, cap could be as low as one milestone payment.",after:"Tiered liability: general cap at 2x total contract value, with super-cap carve-outs for IP infringement, intentional misconduct, and confidentiality breach (3x contract value)."}],dimensions:[{dimension:"IP Protection",before:.8,after:4.3,delta:3.5},{dimension:"Classification Safety",before:1.2,after:3.6,delta:2.4},{dimension:"Balance/Fairness",before:1.5,after:3.8,delta:2.3},{dimension:"Readability",before:2,after:3.7,delta:1.7},{dimension:"Enforceability",before:1.8,after:4,delta:2.2}],finalOutput:rt,debateResolutions:[{topic:"IP assignment scope vs. misclassification risk",resolution:'Assignment clause narrowed to "Deliverable Work Product" (code committed to company repos for company projects). Pre-existing IP schedule preserves contractor independence. Open-source contributions explicitly carved out.',winningPosition:`Employment Counsel's misclassification concern refined the IP approach. Narrow, specific assignment is both legally safer and practically clearer than broad "all ideas conceived" language.`,evidenceWeight:"DOL and NLRB guidance on IP assignment breadth as classification indicator, combined with copyright assignment best practices.",escalationNeeded:!1,confidence:.94}],gateDecisions:[{gateType:"ethics critical",decision:"approve",summary:"One RED finding (IP ownership gap) and three YELLOW findings (misclassification, termination, liability) approved for remediation."},{gateType:"final delivery",decision:"approve",summary:"All three verification checks passed. IP assignment validated, classification risk mitigated, legal accuracy confirmed."}],verificationChecks:[{type:"ip-assignment",passed:!0,label:"IP Assignment Validity",score:.95},{type:"classification-risk",passed:!0,label:"Classification Risk",score:.88},{type:"legal-accuracy",passed:!0,label:"Legal Accuracy",score:.93}],narrative:[{phase:"Analysis",heading:"Six specialists examine a developer services agreement",body:`The engagement began with six specialists reviewing CodeCraft's freelance developer agreement. The IP Specialist immediately identified the critical gap: the agreement relies on "work made for hire" doctrine, which does not apply to software created by independent contractors under 17 USC 101. Employment Counsel flagged three misclassification risk factors: exclusive engagement, fixed hours, and mandatory company equipment. The Contract Specialist found one-sided termination provisions and an insufficient liability cap.`,agents:["IP Specialist","Employment Counsel","Contract Specialist","Plain Language Specialist","Risk Pricer","Synthesis Editor"]},{phase:"Debate",heading:"The assignment-classification tension",body:`Employment Counsel challenged the IP Specialist's initial fix: a broad assignment clause ("all right, title, and interest in all ideas conceived during the engagement") could itself be used as evidence of employment relationship by labor boards. The IP Specialist accepted the challenge and narrowed the clause to "Deliverable Work Product" specifically defined as code committed to CodeCraft repositories. A Pre-existing IP Schedule was added to document what the contractor brings in.`,agents:["Employment Counsel","IP Specialist"],highlight:"This debate prevented a common trap: fixing the IP problem in a way that creates a misclassification problem. The cross-disciplinary challenge produced a better solution than either specialist would have reached alone."},{phase:"Ethics Gate",heading:"Four findings approved for remediation",body:"The ethics gate reviewed all four findings. The IP ownership gap was classified as RED due to CodeCraft's prior dispute history — this is the exact vulnerability that caused the previous lawsuit. The three YELLOW findings (misclassification, termination, liability) were approved for comprehensive remediation.",agents:[],highlight:"The prior IP dispute context elevated the urgency. This was not a theoretical risk but a proven vulnerability."},{phase:"Transformation",heading:"Rebuilding the agreement with balanced protections",body:"The IP Specialist drafted a narrowly-scoped assignment clause with Pre-existing IP Schedule and open-source carve-outs. The Contract Specialist rewrote termination provisions with balanced 14-day notice and a mandatory 5-day code handover period. The first quality check failed on two specificity gaps; after revision, the second check passed.",agents:["IP Specialist","Contract Specialist","Plain Language Specialist"]},{phase:"Verification",heading:"Three independent checks — all passed",body:"Three verification checks confirmed the agreement's soundness: IP assignment validity (narrowly-scoped clause with proper backup assignment), classification risk assessment (control factors removed, safe harbor provisions added), and legal accuracy (all obligations balanced, no unintended gaps).",agents:[]},{phase:"Delivery",heading:"Work product delivered",body:"All workflow steps completed. The CodeCraft Developer Services Agreement has been revised with robust IP protections, classification safety, balanced termination, and appropriate liability caps. The document is ready for client review and independent counsel verification.",agents:[]}],debate:{findingsCount:4,challengesCount:1,resolutionsCount:1,unresolvedCount:0},verification:{resultsCount:3,passed:3,failed:0,confidence:.92,breakdown:[{type:"self",passed:!0,confidence:.95,label:"IP Assignment Check"},{type:"cross",passed:!0,confidence:.88,label:"Classification Cross-Check"},{type:"score",passed:!0,confidence:.93,label:"Legal Accuracy Score"}]},cost:{accumulated:4.22,budget:10,remaining:5.78},agentPerformance:[{name:"IP Specialist",role:"ip-specialist",findingsPosted:1,challengesSurvived:1,avgConfidence:.97},{name:"Employment Counsel",role:"employment-counsel",findingsPosted:1,challengesSurvived:0,avgConfidence:.89},{name:"Contract Specialist",role:"contract-specialist",findingsPosted:2,challengesSurvived:0,avgConfidence:.85},{name:"Plain Language Specialist",role:"plain-language-specialist",findingsPosted:0,challengesSurvived:0,avgConfidence:0},{name:"Risk Pricer",role:"risk-pricer",findingsPosted:0,challengesSurvived:0,avgConfidence:0},{name:"Synthesis Editor",role:"synthesis-editor",findingsPosted:0,challengesSurvived:0,avgConfidence:0}],eventCount:38,limitations:{flaggedForHumanReview:["IP assignment clause should be reviewed by IP counsel for state-specific enforceability","Misclassification safe harbor provisions should be validated against current DOL guidance","Non-compete provisions may be unenforceable in certain states (CA, CO, MN, ND, OK)"],confidenceIntervals:"",disclaimer:"This analysis was produced by an AI system with multi-agent verification. For matters involving regulatory filings, litigation, or binding contractual obligations, we recommend independent counsel verification."},nextSteps:[{label:"Review with IP counsel",description:"Have an intellectual property attorney review the assignment clause and Pre-existing IP Schedule template, particularly for enforceability in your jurisdiction.",kind:"action"},{label:"Employment law review",description:"Have an employment attorney confirm the misclassification mitigations are sufficient for the jurisdictions where your contractors are located.",kind:"action"},{label:"Implement Pre-existing IP workflow",description:"Create an onboarding process where new contractors complete the Pre-existing IP Schedule before starting work. This protects both parties.",kind:"action"},{label:"California contractors",description:"If engaging contractors in California, ensure compliance with AB5 and the specific exemptions for professional services. Additional contract language may be required.",kind:"watchout"},{label:"Annual agreement review",description:"Schedule annual review of the agreement template as employment law and IP assignment rules continue to evolve, particularly regarding AI-generated code ownership.",kind:"schedule"}]}}const rt=`# CodeCraft Developer Services Agreement

**DRAFT — For Client Review**  ·  *IP and classification risk remediation by Lavern*
*Effective Date: [Effective Date]*

---

**PARTIES**

This Agreement is entered into by and between:

**CodeCraft, Inc.**, a Delaware corporation, with its principal place of business at [Address] (“Company”); and

**[Contractor Name]**, [an individual / a [State] [entity type]], with its principal place of business at [Address] (“Contractor”).

---

**RECITALS**

WHEREAS, the Company desires to engage the Contractor to provide software development services; and

WHEREAS, the Contractor desires to provide such services as an independent contractor on the terms and conditions set forth herein;

NOW, THEREFORE, in consideration of the mutual covenants and agreements set forth below, and for other good and valuable consideration, the parties agree as follows:

---

> **Key changes from previous draft:**
> - IP assignment narrowed to “Deliverable Work Product” — contractor retains pre-existing IP, open-source contributions, and personal projects.
> - Exclusivity requirement removed; fixed hours removed — reduces misclassification risk under California ABC test.
> - Notice period balanced: 14 days each way (was 7 company / 30 contractor).
> - Liability tiered: 2× general cap, 3× for IP/confidentiality, uncapped for fraud.

---

## Table of Contents

1. Engagement and Scope
2. Independent Contractor Relationship
3. Deliverables, Acceptance, and Quality Standards
4. Compensation and Payment
5. Intellectual Property
6. Pre-existing IP Schedule
7. Confidentiality and Security
8. Non-Solicitation
9. Termination and Transition
10. Liability and Indemnification
11. Dispute Resolution
12. Representations and Warranties
13. General Provisions

---

## 1. Engagement and Scope

This Developer Services Agreement (“Agreement”) is entered into by CodeCraft, Inc., a Delaware corporation (“Company”), and the individual or entity identified in the attached Statement of Work (“Contractor”).

The Contractor will provide software development services as described in each Statement of Work (“SOW”) issued under this Agreement. Each SOW forms a part of this Agreement and will specify: the scope of work, deliverables, milestone schedule, acceptance criteria, and compensation.

This Agreement governs all engagements between the parties from its Effective Date unless and until superseded by a fully executed replacement agreement. In the event of conflict between the terms of this Agreement and an SOW, the SOW controls for the subject matter of that SOW only.

## 2. Independent Contractor Relationship

The Contractor is an independent contractor. The Contractor is not an employee, agent, joint venturer, or partner of the Company. This Agreement does not create an employment relationship.

### 2.1 Indicators of Independent Contractor Status

The following provisions are included to support an accurate classification under applicable law, including the California ABC test, IRS common law factors, and applicable federal and state misclassification standards. The parties intend these provisions to reflect the genuine nature of their relationship.

- **Schedule flexibility.** The Contractor determines when, where, and how to perform work, subject only to agreed milestone deadlines. The Company does not set or track work hours.
- **No exclusivity.** The Contractor is free to provide services to other clients concurrently with this engagement, provided there is no actual conflict of interest (see Section 7.3).
- **Own tools and environment.** The Contractor may use their own development hardware, software, and environment. Company-provided access credentials and systems are available for project purposes but their use is not mandatory.
- **Tax responsibility.** The Contractor is solely responsible for all federal, state, and local income taxes, self-employment taxes, and other tax obligations arising from compensation paid under this Agreement. The Company will issue Form 1099-NEC for annual payments of $600 or more.

### 2.2 No Benefits

The Company does not provide the Contractor with employee benefits, including health insurance, retirement benefits, paid time off, stock options, or expense reimbursement except as explicitly agreed in an SOW.

### 2.3 Contractor Acknowledgment

The Contractor acknowledges that: (a) they have the right to enter into this Agreement; (b) this Agreement does not conflict with any other contract or obligation by which the Contractor is bound; and (c) they are not currently subject to any non-compete agreement that would restrict their performance of services for the Company.

## 3. Deliverables, Acceptance, and Quality Standards

### 3.1 Deliverables

The Contractor will deliver software code, documentation, designs, and other materials as specified in each SOW (“Deliverables”). All Deliverables must:

- Conform to the specifications, acceptance criteria, and technical standards set out in the applicable SOW
- Pass automated test suites as specified in the SOW (minimum code coverage as specified)
- Pass code review by the Company’s engineering team (typically within 5 business days of submission)
- Be free of known critical and high-severity security vulnerabilities at the time of delivery
- Include documentation as specified in the SOW (inline code documentation, README updates, API documentation where applicable)

### 3.2 Acceptance Process

Upon submission of a Deliverable, the Company will review and either:
- **Accept** the Deliverable (triggering the applicable milestone payment), or
- **Reject** with written notice specifying the deficiencies

The Contractor will have **10 business days** to cure deficiencies in a rejected Deliverable. If a Deliverable fails a second review, the parties will meet within 5 business days to agree on a remediation plan.

The Company will not unreasonably withhold or delay acceptance of a Deliverable that substantially conforms to the SOW specifications.

### 3.3 Warranty Period

Following acceptance, the Contractor warrants each Deliverable against material defects in workmanship for **60 days** (the “Warranty Period”). If a material defect is discovered during the Warranty Period, the Contractor will correct it at no additional charge within a reasonable time. This warranty does not cover defects caused by modifications made by the Company after acceptance.

## 4. Compensation and Payment

### 4.1 Rates and Milestones

Compensation for each engagement is set out in the applicable SOW. Compensation may be structured as a fixed fee per milestone, an hourly rate, or a combination.

### 4.2 Invoicing and Payment Terms

The Contractor will submit invoices upon completion and acceptance of each milestone. Payment is due **within 30 calendar days** of the Company’s receipt of a conforming invoice. Invoices must specify: the SOW reference, the milestone or period covered, the amount due, and payment instructions.

### 4.3 Late Payment

Undisputed amounts not paid within 30 days accrue interest at the lesser of **1.5% per month** (18% per annum) or the maximum rate permitted by applicable law, calculated from the due date until the date of payment.

### 4.4 Disputed Invoices

If the Company disputes any portion of an invoice, it will notify the Contractor in writing within 15 days of receipt, specifying the disputed amount and the basis for the dispute. The Company will pay undisputed amounts by the original due date. The parties will use good faith efforts to resolve any dispute within 30 days.

### 4.5 Expenses

The Company will reimburse pre-approved expenses only. The Contractor must obtain written approval before incurring any reimbursable expense and must submit receipts with each invoice.

## 5. Intellectual Property

### 5.1 Definitions

“Deliverable Work Product” means all code, documentation, designs, inventions, works of authorship, and other materials that: (a) are created by the Contractor specifically for the Company in the performance of services under this Agreement, AND (b) are either delivered to the Company as a milestone Deliverable or committed to the Company’s code repositories for the purpose of Company projects.

“Pre-existing IP” means intellectual property that the Contractor owned or controlled before the Effective Date of this Agreement, or that is developed by the Contractor independently of this Agreement without use of the Company’s Confidential Information, resources, or equipment.

### 5.2 Assignment of Deliverable Work Product

To the extent any Deliverable Work Product qualifies as a “work made for hire” under 17 U.S.C. § 101, it is hereby designated as such, with the Company as the author. To the extent any Deliverable Work Product does not qualify as a work made for hire (including because independent contractors’ software generally does not under 17 U.S.C. § 101), the Contractor hereby irrevocably assigns to the Company all right, title, and interest in and to such Deliverable Work Product, including all copyright, patent, trade secret, and other intellectual property rights, worldwide, in perpetuity.

The Contractor agrees to execute any documents and take any actions reasonably requested by the Company to perfect, record, or enforce the Company’s ownership of assigned intellectual property.

### 5.3 Retained Contractor Rights

The Contractor retains all right, title, and interest in:

- **Pre-existing IP**, as identified in the Pre-existing IP Schedule (Section 6) and updated as required
- **General programming knowledge**, methodologies, algorithms, techniques, and know-how of general applicability (not specific to the Company’s products or confidential information)
- **Open-source contributions** to projects listed in the Pre-existing IP Schedule, even if developed using skills or knowledge gained during the engagement
- **Personal projects** developed on the Contractor’s own time, using the Contractor’s own resources, that are not related to the Company’s business and do not incorporate Confidential Information

### 5.4 License to Pre-existing IP

If the Contractor incorporates any Pre-existing IP into Deliverable Work Product, the Contractor hereby grants the Company a **perpetual, irrevocable, non-exclusive, royalty-free, worldwide license** to use, copy, modify, distribute, and sublicense such Pre-existing IP solely as incorporated in the Deliverable Work Product.

### 5.5 Moral Rights Waiver

To the extent permitted by applicable law, the Contractor waives any moral rights in Deliverable Work Product in favor of the Company and its successors.

## 6. Pre-existing IP Schedule

The Contractor must complete and deliver this schedule before beginning work under any SOW. The schedule must list any pre-existing intellectual property (owned or licensed by the Contractor) that may be incorporated into or relied upon in delivering work under this Agreement.

**Pre-existing Proprietary IP:**

| Item | Brief Description | Owner | Permitted Use in Deliverables |
|------|------------------|-------|------------------------------|
| [Item name] | [Brief description] | [Contractor / Third Party] | [Describe permitted use] |

**Open-Source Projects (Continuing Contributions):**

| Project Name | License (SPDX identifier) | Contribution Scope |
|---|---|---|
| [Project name] | [e.g., MIT, Apache-2.0] | [General contributions / Feature X only] |

The Contractor must update this schedule promptly if additional Pre-existing IP is incorporated into any Deliverable. The Company’s written approval is required before incorporating any Pre-existing IP that is subject to a copyleft license (GPL, AGPL, LGPL, or similar) into Deliverable Work Product intended for proprietary distribution.

## 7. Confidentiality and Security

### 7.1 Confidential Information

“Confidential Information” means any non-public information disclosed by the Company to the Contractor in connection with this Agreement, including source code, product roadmaps, customer data, business plans, financial information, and the terms of this Agreement.

Confidential Information does not include information that: (a) is or becomes publicly available without the Contractor’s breach; (b) the Contractor independently developed without use of Confidential Information; (c) the Contractor received from a third party without restriction; or (d) was known to the Contractor before disclosure, as evidenced by written records.

### 7.2 Obligations

The Contractor will: (a) use Confidential Information only for purposes of performing services under this Agreement; (b) protect Confidential Information using at least the same care as the Contractor uses for their own confidential information, and no less than reasonable care; (c) not disclose Confidential Information to third parties without prior written consent; and (d) promptly notify the Company of any unauthorized disclosure or suspected breach.

These obligations survive termination of this Agreement for **3 years** for general Confidential Information, and indefinitely for trade secrets under applicable trade secret law.

### 7.3 Conflict of Interest

The Contractor will promptly disclose to the Company any circumstances that could reasonably be perceived as a conflict of interest with the Company’s business. The Contractor will not use Confidential Information to benefit a competitor of the Company.

### 7.4 Security Obligations

The Contractor will: (a) store and access Confidential Information only on password-protected, encrypted devices; (b) not store Confidential Information on personal cloud storage services without prior written approval; (c) notify the Company within 48 hours of any lost or stolen device that contained Confidential Information; and (d) return or certify the destruction of all Confidential Information upon termination.

## 8. Non-Solicitation

During the term of this Agreement and for **12 months** after its termination, the Contractor will not directly solicit for employment any employee of the Company who the Contractor had material interactions with during the engagement.

This provision does not restrict: (a) general solicitation not targeted at Company employees (e.g., public job postings); or (b) responding to an unsolicited approach from a Company employee.

The parties acknowledge that this non-solicitation obligation is narrowly tailored to protect legitimate business interests and does not restrict the Contractor’s ability to perform services for other companies, including competitors of the Company.

## 9. Termination and Transition

### 9.1 Termination for Convenience

Either party may terminate this Agreement or any active SOW with **14 calendar days’ written notice**.

### 9.2 Termination for Cause

Either party may terminate this Agreement or any active SOW immediately upon written notice if the other party: (a) commits a material breach that remains uncured after **10 business days’** written notice specifying the breach in reasonable detail; (b) becomes insolvent, makes an assignment for the benefit of creditors, or is subject to insolvency proceedings; or (c) commits fraud or willful misconduct.

### 9.3 Code Handover Protocol

Upon notice of termination (for any reason), the following transition process applies to each active SOW:

**Days 1–5 (Work Completion):**
- The Contractor documents all work in progress with sufficient detail for a replacement developer to continue.
- All open pull requests are completed, reviewed, and either merged or closed with documentation of the reason for closure.
- No new code is introduced that increases handover complexity without written approval.

**Days 6–10 (Knowledge Transfer):**
- The Contractor participates in up to 5 hours of knowledge transfer sessions per active SOW, at mutually agreed times.
- The Contractor documents non-obvious design decisions, known issues, and technical debt.

**Days 11–14 (Access Revocation):**
- All Company-issued credentials, access tokens, and system access are rotated and revoked.
- The Contractor delivers a final documentation package as specified in the applicable SOW.
- The Contractor certifies in writing that all Confidential Information has been deleted from the Contractor’s devices.

### 9.4 Payment on Termination

On termination, the Company will pay: (a) all completed and accepted milestone payments not yet paid; and (b) a pro-rata portion of the next uncompleted milestone payment, calculated based on documented, accepted work completed through the termination date. No payment will be made for uncompleted work that does not meet the acceptance criteria in Section 3.

### 9.5 Survival

Sections 5 (Intellectual Property), 6 (Pre-existing IP Schedule), 7 (Confidentiality), 8 (Non-Solicitation), 9.4 (Payment on Termination), 10 (Liability), 12 (Representations and Warranties), and 13 (General Provisions) survive termination or expiration of this Agreement.

## 10. Liability and Indemnification

### 10.1 General Liability Cap

Each party’s total aggregate liability to the other for all claims arising under or related to this Agreement is limited to **two times (2×) the total compensation** paid or payable under all active SOWs in the 12-month period preceding the claim.

### 10.2 Super-Cap Carve-outs

The general cap in Section 10.1 does not apply to the following categories of liability, which are subject to higher caps or are uncapped:

| Category | Cap |
|---|---|
| Breach of IP obligations (Section 5) | 3× total contract value |
| Breach of confidentiality (Section 7) | 3× total contract value |
| Intentional misconduct or fraud | Uncapped |
| Third-party IP infringement indemnification | Uncapped |

### 10.3 Exclusion of Consequential Damages

Neither party is liable to the other for indirect, incidental, special, consequential, exemplary, or punitive damages, including lost profits, loss of data, or loss of goodwill, even if advised of the possibility of such damages. This exclusion does not apply to damages arising from fraud, willful misconduct, or breach of confidentiality obligations.

### 10.4 Indemnification

Each party (“Indemnifying Party”) will defend, indemnify, and hold harmless the other party (“Indemnified Party”) from and against any third-party claims, damages, losses, and expenses (including reasonable attorneys’ fees) arising from: (a) the Indemnifying Party’s breach of this Agreement; (b) the Indemnifying Party’s gross negligence or willful misconduct; or (c) in the case of the Contractor, any claim that Deliverable Work Product infringes a third party’s intellectual property rights.

The Indemnified Party will: (i) promptly notify the Indemnifying Party of any claim; (ii) give the Indemnifying Party sole control of the defense and settlement; and (iii) cooperate reasonably in the defense. The Indemnifying Party will not settle any claim that imposes liability or obligation on the Indemnified Party without prior written consent.

## 11. Dispute Resolution

### 11.1 Informal Resolution

Before initiating any formal dispute process, the parties agree to make a good faith effort to resolve any dispute through direct negotiation. Either party may initiate this process by sending written notice describing the dispute. The parties will meet (in person, by phone, or by video) within 15 business days.

### 11.2 Mediation

If informal resolution fails within 30 days, either party may escalate to non-binding mediation administered by JAMS (or a mutually agreed mediator). Each party bears its own costs; JAMS fees are split equally. Mediation is a prerequisite to arbitration except for injunctive relief.

### 11.3 Arbitration

Any dispute not resolved by mediation will be finally resolved by binding arbitration under JAMS Comprehensive Arbitration Rules. The arbitration will be: (a) conducted by a single arbitrator unless the amount in controversy exceeds $500,000, in which case a three-arbitrator panel; (b) held in [City, State] or by videoconference; (c) conducted in English; and (d) subject to confidentiality obligations on both parties.

The arbitrator may award any remedy available in court. Judgment on the award may be entered in any court of competent jurisdiction.

### 11.4 Exception — Injunctive Relief

Either party may seek emergency injunctive or other equitable relief from a court of competent jurisdiction to prevent irreparable harm pending resolution of a dispute, without waiving the right to arbitration.

### 11.5 Class Action Waiver

All disputes will be resolved on an individual basis. Neither party may bring claims as a plaintiff or class member in any class, consolidated, or representative action.

## 12. Representations and Warranties

Each party represents and warrants to the other that: (a) it has full power and authority to enter into and perform this Agreement; (b) this Agreement does not conflict with any other agreement by which it is bound; and (c) it will comply with all applicable laws in performing its obligations.

The Contractor additionally represents and warrants that:
- All Deliverable Work Product is and will be original work by the Contractor or properly licensed third-party materials identified in Section 6;
- Deliverable Work Product will not infringe any third party’s copyright, patent, trademark, or trade secret rights;
- Deliverable Work Product will not contain any malicious code, undisclosed back doors, or tracking mechanisms;
- The Contractor is not subject to any restrictive covenant (non-compete, IP assignment, or similar) that would conflict with this Agreement.

EXCEPT AS EXPRESSLY STATED IN THIS AGREEMENT, NEITHER PARTY MAKES ANY WARRANTIES, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE.

## 13. General Provisions

**Governing Law.** This Agreement is governed by the laws of the State of [State], without regard to conflict of laws principles. The parties consent to the exclusive jurisdiction of the state and federal courts located in [County, State] for any court proceedings permitted under this Agreement.

**Entire Agreement.** This Agreement and its SOWs constitute the entire agreement between the parties regarding their subject matter and supersede all prior agreements, representations, and understandings.

**Amendments.** This Agreement may only be amended by a written instrument signed by authorized representatives of both parties.

**Severability.** If any provision is found unenforceable, it will be modified to the minimum extent necessary to make it enforceable. The remaining provisions remain in full force.

**No Waiver.** A party’s failure to enforce any right does not constitute a waiver of that right.

**Notices.** All notices must be in writing and delivered by email (with read receipt or written confirmation) or overnight courier to the addresses specified in the applicable SOW.

**Force Majeure.** Neither party is liable for delays caused by circumstances beyond its reasonable control, provided the affected party gives prompt notice and uses reasonable efforts to resume performance.

**Assignment.** The Contractor may not assign this Agreement or any rights under it without prior written consent. The Company may assign this Agreement in connection with a merger, acquisition, or sale of substantially all assets, with notice to the Contractor.

**Counterparts.** This Agreement may be executed in counterparts, including electronic counterparts, each of which is an original and together constitute a single instrument.

---

*This Developer Services Agreement was last updated on [Effective Date].*

---

*Prepared by Lavern — Multi-Agent Legal Design System*
*This document was produced with AI assistance and reviewed by multi-agent verification. It does not constitute legal advice. For matters involving IP ownership, worker classification, or any binding contractual obligation, please verify with qualified legal professionals.*
`;function at({matterNumber:o,matterType:s,jurisdiction:i,onBack:a,onSkip:r}){return e.jsxs("div",{style:re.header,children:[e.jsxs("button",{onClick:a,style:re.navBtn,onMouseEnter:n=>{const c=n.currentTarget;c.style.backgroundColor=t.text,c.style.color="#fff"},onMouseLeave:n=>{const c=n.currentTarget;c.style.backgroundColor="transparent",c.style.color=t.text},children:["←"," Back"]}),e.jsxs("div",{style:re.center,children:[e.jsx("div",{style:re.logoType,children:e.jsx(Ee,{color:t.textMuted})}),e.jsxs("h1",{style:re.title,children:["Lavern ",e.jsx("span",{style:{fontWeight:500},children:"Delivery"})]}),o&&e.jsxs("div",{style:re.matterBadge,children:[o,s?` · ${s.replace(/_/g," ")}`:"",i?` · ${i}`:""]})]}),r?e.jsxs("button",{onClick:r,style:re.navBtn,onMouseEnter:n=>{const c=n.currentTarget;c.style.backgroundColor=t.text,c.style.color="#fff"},onMouseLeave:n=>{const c=n.currentTarget;c.style.backgroundColor="transparent",c.style.color=t.text},children:["Skip ","→"]}):e.jsx("div",{style:{width:60}})]})}const re={header:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:l.xl},navBtn:{padding:"10px 16px",borderRadius:R.sm,border:`1.5px solid ${t.text}`,backgroundColor:"transparent",color:t.text,fontFamily:u.sans,fontSize:11,fontWeight:600,letterSpacing:1,textTransform:"uppercase",cursor:"pointer",transition:"background-color 0.25s ease, color 0.25s ease, border-color 0.25s ease"},center:{textAlign:"center",flex:1,minWidth:0,overflow:"hidden"},logoType:{fontSize:10,fontWeight:600,fontFamily:u.sans,color:t.textMuted,letterSpacing:4,textTransform:"uppercase"},title:{fontSize:"clamp(24px, 6vw, 36px)",fontWeight:400,fontFamily:u.sans,color:t.text,margin:"8px 0 0",letterSpacing:-.5},matterBadge:{fontSize:12,fontFamily:u.sans,color:t.textMuted,marginTop:8,textTransform:"capitalize",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}},st=[{id:"work",label:"The Work"},{id:"review",label:"The Review"},{id:"story",label:"The Story"},{id:"scorecard",label:"The Scorecard"},{id:"next-steps",label:"Next Steps"},{id:"conversation",label:"Ask the Team"}];function lt({activeTab:o,onTabChange:s}){const{isMobile:i}=We(),a=f.useRef(null),r=f.useRef(new Map),[n,c]=f.useState({left:0,width:0}),[m,d]=f.useState(!1),p=f.useCallback(()=>{const h=a.current,C=r.current.get(o);if(!h||!C)return;const w=h.getBoundingClientRect(),I=C.getBoundingClientRect();c({left:I.left-w.left,width:I.width}),m||requestAnimationFrame(()=>d(!0))},[o,m]);return f.useLayoutEffect(()=>{p()},[p]),f.useLayoutEffect(()=>(window.addEventListener("resize",p),()=>window.removeEventListener("resize",p)),[p]),e.jsxs("nav",{ref:a,style:Pe.bar,role:"tablist","aria-label":"Delivery sections",children:[st.map(h=>{const C=o===h.id;return e.jsx("button",{id:`tab-${h.id}`,role:"tab","aria-selected":C,"aria-controls":`panel-${h.id}`,ref:w=>{w&&r.current.set(h.id,w)},onClick:()=>s(h.id),style:{...Pe.tab,color:C?t.text:t.textMuted,fontWeight:C?600:500,...i?{padding:"12px 14px",fontSize:12,minHeight:44}:{}},onMouseEnter:w=>{C||(w.currentTarget.style.color=t.text)},onMouseLeave:w=>{C||(w.currentTarget.style.color=t.textMuted)},children:h.label},h.id)}),e.jsx("div",{style:{position:"absolute",bottom:0,left:n.left,width:n.width,height:2,backgroundColor:t.accent,borderRadius:1,transition:m?"left 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)":"none",pointerEvents:"none"}})]})}const Pe={bar:{display:"flex",gap:l.xs,borderBottom:`1px solid ${t.border}`,marginBottom:l.xxl,overflowX:"auto",position:"relative",WebkitOverflowScrolling:"touch",scrollSnapType:"x mandatory",scrollbarWidth:"none",msOverflowStyle:"none"},tab:{padding:"10px 20px",minHeight:44,scrollSnapAlign:"start",border:"none",borderBottom:"2px solid transparent",backgroundColor:"transparent",color:t.textMuted,fontFamily:u.sans,fontSize:13,fontWeight:500,cursor:"pointer",marginBottom:-1,transition:"color 0.25s ease",whiteSpace:"nowrap",flexShrink:0}},ct=[{id:"traditional",label:"Traditional",desc:"Classic law-firm"},{id:"elegant",label:"Elegant",desc:"Warm editorial"},{id:"accessible",label:"Accessible",desc:"WCAG AA"}];function dt(o){const s=o.split(`
`),i=[];let a=!1,r=null,n=[];const c=()=>{r&&(i.push(`</${r}>`),r=null)},m=()=>{a&&(i.push("</p>"),a=!1)},d=()=>{if(n.length===0)return;const[p,...h]=n,C=(p??[]).map(I=>`<th>${ee(I)}</th>`).join(""),w=h.map(I=>`<tr>${I.map(g=>`<td>${ee(g)}</td>`).join("")}</tr>`).join("");i.push(`<table><thead><tr>${C}</tr></thead><tbody>${w}</tbody></table>`),n=[]};for(const p of s){const h=p.replace(/&/g,"&amp;").replace(/</g,"&lt;");if(h.trim()===""){d(),c(),m();continue}const C=h.trim();if(C.startsWith("|")&&C.endsWith("|")){m(),c();const y=C.split("|").slice(1,-1).map(k=>k.trim());y.every(k=>/^[-: ]+$/.test(k))||n.push(y);continue}n.length>0&&d();const w=h.match(/^#### (.+)$/);if(w){m(),c(),i.push(`<h4>${ee(w[1])}</h4>`);continue}const I=h.match(/^### (.+)$/);if(I){m(),c(),i.push(`<h3>${ee(I[1])}</h3>`);continue}const g=h.match(/^## (.+)$/);if(g){m(),c(),i.push(`<h2>${ee(g[1])}</h2>`);continue}const T=h.match(/^# (.+)$/);if(T){m(),c(),i.push(`<h1>${ee(T[1])}</h1>`);continue}if(C==="---"){m(),c(),i.push("<hr>");continue}const j=h.match(/^> (.+)$/);if(j){m(),c(),i.push(`<blockquote><p>${ee(j[1])}</p></blockquote>`);continue}const P=h.match(/^[-*] (.+)$/);if(P){m(),r!=="ul"&&(c(),i.push("<ul>"),r="ul"),i.push(`<li>${ee(P[1])}</li>`);continue}const L=h.match(/^\d+\. (.+)$/);if(L){m(),r!=="ol"&&(c(),i.push("<ol>"),r="ol"),i.push(`<li>${ee(L[1])}</li>`);continue}c(),a||(i.push("<p>"),a=!0),i.push(ee(h))}return d(),c(),m(),i.join(`
`)}function ee(o){return o.replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>").replace(/\*(.+?)\*/g,"<span>$1</span>")}function ut(o){return o.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function ht(o,s,i){const a=new Blob([o],{type:i}),r=URL.createObjectURL(a),n=document.createElement("a");n.href=r,n.download=s,document.body.appendChild(n),n.click(),document.body.removeChild(n),URL.revokeObjectURL(r)}function pt(o){const s=[];if(s.push(`# ${o.documentTitle}`,""),s.push(`**Date:** ${new Date().toLocaleDateString()}`,""),s.push("## Executive Summary","",o.executiveSummary,""),o.keyChanges.length>0){s.push("## Key Changes","");for(const i of o.keyChanges)s.push(`### ${i.title}`,"",`**Before:** ${i.before}`,"",`**After:** ${i.after}`,"")}if(o.debateResolutions.length>0){s.push("## Review Outcomes","");for(const i of o.debateResolutions)s.push(`- **${i.topic}:** ${i.resolution}`);s.push("")}if(o.nextSteps.length>0){s.push("## Recommended Next Steps","");for(const i of o.nextSteps)s.push(`- **${i.label}:** ${i.description}`);s.push("")}return s.push("---","","*This summary was generated from AI-assisted analysis. Independent counsel verification is recommended for legally binding matters.*",""),s.join(`
`)}function gt({data:o,assemblyStatus:s,onRetry:i,selectedStyle:a,onStyleChange:r}){const n=o.sessionId.startsWith("demo-session"),[c,m]=f.useState("elegant"),d=a??c,p=y=>{m(y),r==null||r(y)},[h,C]=f.useState("idle"),w=s==="ready",I=sessionStorage.getItem("shem-cowork-active")==="true",g=I?Fe():null,T=I&&(g==null?void 0:g.handle)!=null&&g.status!=="disconnected",j=async()=>{if(!(!T||!(g!=null&&g.handle))){C("writing");try{const y=g.handle,k=async(v,S)=>{const E=await(await y.getFileHandle(v,{create:!0})).createWritable();await E.write(new Blob([S],{type:"text/plain"})),await E.close()},b=async(v,S)=>{const E=await(await y.getFileHandle(v,{create:!0})).createWritable();await E.write(S),await E.close()};if(o.finalOutput&&o.finalOutput.length>100)await k(`${o.sessionId}-deliverable.md`,o.finalOutput);else{const v=["# Assembly Failed","","The agents completed their analysis but document assembly failed.","","What happened: The multi-agent pipeline ran successfully, but the final assembly step","could not produce a valid document from the analysis results.","","## What you can do","","- **Retry assembly** from the Delivery page in the dashboard","- **Download structured data** (JSON) which contains all findings and debate resolutions","- **Start a new session** with the same document","",`Session ID: ${o.sessionId}`,`Date: ${new Date().toISOString()}`].join(`
`);await k(`${o.sessionId}-deliverable.md`,v)}if(o.finalOutput&&o.finalOutput.length>100){const v=pt(o);await k(`${o.sessionId}-summary.md`,v)}const A={sessionId:o.sessionId,exportedAt:new Date().toISOString(),debate:{findingsCount:o.debate.findingsCount,resolutions:o.debateResolutions},verification:o.verificationChecks,cost:o.cost};if(await k(`${o.sessionId}-data.json`,JSON.stringify(A,null,2)),!n){const v=`&style=${d}`,F=[{ext:"docx",mime:"application/vnd.openxmlformats-officedocument.wordprocessingml.document"},{ext:"pdf",mime:"application/pdf"}].map(async({ext:E})=>{try{const $=await fetch(`/api/sessions/${o.sessionId}/download?format=${E}${v}`,{credentials:"include"});if($.ok){const K=await $.blob();await b(`${o.sessionId}-deliverable.${E}`,K)}}catch{console.warn(`[cowork] Could not fetch ${E} for folder save`)}});await Promise.all(F)}$e("delivered"),C("done")}catch(y){console.error("[cowork] Failed to save to folder:",y),C("error")}}},P=o.documentTitle.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"")||"document",L=y=>{if(n){const k=o.finalOutput||"# No output yet";{const b={traditional:`
            body{font-family:'Times New Roman',Times,serif;max-width:680px;margin:48px auto;line-height:1.5;color:#1a1a1a;font-size:12pt}
            h1{font-family:'Times New Roman',Times,serif;font-size:16pt;font-weight:bold;text-align:center;border-bottom:2px solid #1a1a1a;padding-bottom:8px;margin-bottom:24px;counter-reset:section}
            h2{font-family:'Times New Roman',Times,serif;font-size:13pt;font-weight:bold;margin-top:28px;counter-increment:section}
            h2::before{content:counter(section) '. '}
            h3{font-family:'Times New Roman',Times,serif;font-size:12pt;font-weight:bold;}
            h4{font-family:'Times New Roman',Times,serif;font-size:11pt;font-weight:bold}
            p{margin:0 0 12px;text-align:justify}
            ul,ol{padding-left:28px;margin:0 0 12px}
            blockquote{border-left:3px solid #1a1a1a;margin:16px 0;padding:8px 16px;}
            hr{border:none;border-top:1px solid #1a1a1a;margin:24px 0}
            table{width:100%;border-collapse:collapse;border-spacing:0;margin:16px 0;font-size:11pt;line-height:1.4}
            th{background:#1a1a1a;color:#fff;padding:6px 10px;text-align:left;font-weight:bold;font-family:'Times New Roman',Times,serif;line-height:1.4}
            td{padding:6px 10px;border:1px solid #ccc;vertical-align:top;line-height:1.4}
            tr:nth-child(even) td{background:#f5f5f5}
          `,elegant:`
            @import url('https://fonts.googleapis.com/css2?family=Newsreader:wght@300;400;500;600;700;800&family=Geist:wght@400;500;600;700&display=swap');
            body{font-family:'Geist',Helvetica,sans-serif;max-width:720px;margin:56px auto;line-height:1.8;color:#2c2118;font-size:14px;font-weight:300;background:#faf8f5}
            h1{font-family:'Newsreader',Georgia,serif;font-size:36px;font-weight:300;color:#b85c38;line-height:1.1;margin-bottom:32px;border:none}
            h2{font-family:'Newsreader',Georgia,serif;font-size:24px;font-weight:300;color:#2c2118;margin-top:40px;border-bottom:1px solid rgba(44,33,24,.12);padding-bottom:8px}
            h3{font-family:'Newsreader',Georgia,serif;font-size:18px;font-weight:400;color:#b85c38}
            h4{font-family:'Geist',Helvetica,sans-serif;font-size:13px;font-weight:500;color:#2c2118;margin-top:24px}
            p{margin:0 0 16px}
            ul,ol{padding-left:24px;margin:0 0 16px}
            blockquote{border-left:2px solid #b85c38;margin:24px 0;padding:12px 20px;color:#6b5744}
            hr{border:none;border-top:1px solid rgba(44,33,24,.15);margin:32px 0}
            strong{font-weight:500}
            table{width:100%;border-collapse:collapse;border-spacing:0;margin:24px 0;font-size:13px;line-height:1.4}
            th{background:#f5ede8;color:#2c2118;padding:7px 12px;text-align:left;font-weight:500;font-family:'Newsreader',Georgia,serif;font-size:14px;border-bottom:2px solid #c4795a;line-height:1.4}
            td{padding:7px 12px;border-bottom:1px solid #ddd0c8;vertical-align:top;line-height:1.4}
            tr:last-child td{border-bottom:none}
          `,accessible:`
            body{font-family:Verdana,Geneva,sans-serif;max-width:740px;margin:40px auto;line-height:1.8;color:#111;font-size:16px;background:#fff}
            h1{font-size:28px;font-weight:700;color:#000;margin-bottom:24px;letter-spacing:0.12px}
            h2{font-size:22px;font-weight:700;color:#000;margin-top:36px;border-bottom:3px solid #005fcc;padding-bottom:6px}
            h3{font-size:18px;font-weight:700;color:#000}
            h4{font-size:16px;font-weight:700;color:#000}
            p{margin:0 0 16px}
            a{color:#005fcc;text-decoration:underline}
            ul,ol{padding-left:28px;margin:0 0 16px}
            li{margin-bottom:6px}
            blockquote{background:#f0f4ff;border-left:4px solid #005fcc;margin:20px 0;padding:12px 20px}
            hr{border:none;border-top:2px solid #ccc;margin:28px 0}
            strong{font-weight:700}
            table{width:100%;border-collapse:collapse;border-spacing:0;margin:20px 0;font-size:15px;line-height:1.4}
            th{background:#005fcc;color:#fff;padding:7px 14px;text-align:left;font-weight:700;border:2px solid #003d80;line-height:1.4}
            td{padding:7px 14px;border:1px solid #ccc;vertical-align:top;line-height:1.4}
            tr:nth-child(even) td{background:#f0f4ff}
          `},A=`<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><title>${ut(o.documentTitle)}</title>
<style>${b[d]}</style>
</head><body>${dt(k)}</body></html>`;ht(A,`${P}-${d}.doc`,"text/html")}}else{const k=`&style=${d}`;window.open(`/api/sessions/${o.sessionId}/download?format=${y}${k}`,"_blank")}};return e.jsxs("div",{style:U.panel,children:[e.jsx("div",{style:U.panelHeader,children:e.jsx("div",{style:U.panelTitle,children:"Download Deliverable"})}),T&&e.jsxs("button",{onClick:j,disabled:h==="writing"||h==="done",style:{...U.saveToFolderBtn,...h==="done"?U.saveToFolderDone:{},...h==="error"?U.saveToFolderError:{}},onMouseEnter:y=>{h==="idle"&&(y.currentTarget.style.backgroundColor=t.accentLight)},onMouseLeave:y=>{h==="idle"&&(y.currentTarget.style.backgroundColor=t.bgCard)},children:[e.jsx("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",style:{flexShrink:0},children:e.jsx("path",{d:"M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"})}),e.jsxs("span",{children:[h==="idle"&&`Save all formats to ${(g==null?void 0:g.folderName)??"folder"}`,h==="writing"&&"Writing files…",h==="done"&&`All files saved to ${(g==null?void 0:g.folderName)??"folder"}`,h==="error"&&"Save failed — use downloads below"]})]}),e.jsxs("div",{style:U.styleSection,children:[e.jsx("div",{style:U.styleLabel,children:"Document Style"}),e.jsx("div",{style:U.stylePills,children:ct.map(y=>{const k=d===y.id;return e.jsxs("button",{onClick:()=>p(y.id),style:{...U.pill,...k?U.pillActive:{}},children:[e.jsx("span",{style:U.pillName,children:y.label}),e.jsx("span",{style:{...U.pillDesc,color:k?"rgba(255,255,255,0.7)":t.textMuted},children:y.desc})]},y.id)})})]}),s==="polling"&&!n&&e.jsxs("div",{style:U.assemblyPolling,children:[e.jsx("span",{style:U.spinner}),"Assembling document — this usually takes 30–60 seconds. The page will update automatically."]}),s==="timeout"&&!n&&e.jsxs("div",{style:U.assemblyError,children:["Document assembly timed out. Structured data and executive brief are still available.",i&&e.jsx("button",{onClick:i,style:U.retryBtn,children:"Retry Assembly"})]}),s==="error"&&!n&&e.jsxs("div",{style:U.assemblyError,children:["Document assembly failed. Try again or download structured data below.",i&&e.jsx("button",{onClick:i,style:U.retryBtn,children:"Retry Assembly"})]}),e.jsx("div",{style:{display:"flex",justifyContent:"center"},children:e.jsx(mt,{label:"Download",sub:n?`.doc · ${d}`:`.docx · ${d}`,primary:!0,onClick:()=>L("docx"),disabled:!n&&!w})})]})}function mt({label:o,sub:s,primary:i,disabled:a,onClick:r}){const[n,c]=f.useState(!1),m=()=>{n||a||(r(),c(!0),setTimeout(()=>c(!1),2e3))};return e.jsxs("button",{onClick:m,disabled:a,style:{...U.dlBtn,...i?U.dlBtnPrimary:{},...a?U.dlBtnDisabled:{}},onMouseEnter:d=>{a||(d.currentTarget.style.opacity="0.82")},onMouseLeave:d=>{a||(d.currentTarget.style.opacity="1")},children:[e.jsx("span",{style:U.dlBtnLabel,children:n?"Downloading…":o}),e.jsx("span",{style:U.dlBtnSub,children:s})]})}const U={panel:{marginTop:l.xl},panelHeader:{marginBottom:l.md},panelTitle:{fontSize:12,fontWeight:500,color:t.textMuted,textTransform:"uppercase",letterSpacing:.5},assemblyPolling:{display:"flex",alignItems:"center",gap:10,fontSize:12,fontFamily:u.sans,color:t.textMuted,backgroundColor:"rgba(139, 115, 85, 0.06)",border:"1px solid rgba(139, 115, 85, 0.15)",borderRadius:R.sm,padding:"10px 16px",marginBottom:l.md,lineHeight:1.5},assemblyError:{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",fontSize:12,fontFamily:u.sans,color:t.danger,backgroundColor:"rgba(180, 60, 60, 0.06)",border:"1px solid rgba(180, 60, 60, 0.2)",borderRadius:R.sm,padding:"10px 16px",marginBottom:l.md,lineHeight:1.5},spinner:{display:"inline-block",width:14,height:14,border:"2px solid rgba(139, 115, 85, 0.2)",borderTopColor:t.textMuted,borderRadius:"50%",animation:"spin 0.8s linear infinite",flexShrink:0},retryBtn:{marginLeft:"auto",padding:"4px 12px",fontSize:11,fontWeight:600,fontFamily:u.sans,color:t.danger,backgroundColor:"transparent",border:`1px solid ${t.danger}`,borderRadius:R.sm,cursor:"pointer",transition:"background-color 0.15s ease",whiteSpace:"nowrap"},styleSection:{marginBottom:l.lg},styleLabel:{fontSize:11,fontWeight:500,color:t.textMuted,marginBottom:l.sm,fontFamily:u.sans},stylePills:{display:"flex",flexWrap:"wrap",gap:l.sm},pill:{display:"flex",flexDirection:"column",alignItems:"center",gap:2,padding:"10px 20px",borderRadius:R.lg,border:`1px solid ${t.border}`,backgroundColor:t.bgCard,cursor:"pointer",transition:"background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease",flex:1},pillActive:{border:`1px solid ${t.text}`,backgroundColor:t.text,color:"#fff",boxShadow:"0 1px 3px rgba(0,0,0,0.08)"},pillName:{fontSize:12,fontWeight:600,fontFamily:u.sans},pillDesc:{fontSize:10,fontFamily:u.sans},dlBtn:{display:"flex",flexDirection:"column",alignItems:"center",gap:6,padding:"20px 56px",backgroundColor:t.bgCard,border:`1px solid ${t.border}`,borderRadius:R.lg,cursor:"pointer",transition:"opacity 0.15s ease",textAlign:"center",color:t.text,minWidth:240},dlBtnPrimary:{backgroundColor:t.text,border:`1px solid ${t.text}`,color:t.bg},dlBtnDisabled:{opacity:.4,cursor:"not-allowed"},dlBtnLabel:{fontSize:16,fontWeight:600,fontFamily:u.sans,color:"inherit",letterSpacing:.5},dlBtnSub:{fontSize:10,fontFamily:u.mono,color:"inherit",opacity:.55},saveToFolderBtn:{display:"flex",alignItems:"center",gap:8,width:"100%",padding:`${l.md}px ${l.lg}px`,marginBottom:l.lg,backgroundColor:t.bgCard,border:`1px solid ${t.accent}`,borderRadius:R.lg,cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:u.sans,color:t.accent,transition:"background-color 0.15s ease, border-color 0.15s ease"},saveToFolderDone:{borderColor:t.success,color:t.success,cursor:"default"},saveToFolderError:{borderColor:t.danger,color:t.danger,cursor:"default"}},ft=[{id:"traditional",label:"Traditional"},{id:"elegant",label:"Elegant"},{id:"accessible",label:"Accessible"}],yt=[{id:"docx",label:"Word",ext:".docx"},{id:"html",label:"HTML",ext:".html"},{id:"md",label:"Markdown",ext:".md"}],Se=[{id:"executive-memo",mark:"EM",title:"Executive Memo",desc:"Formal memo for leadership"},{id:"board-briefing",mark:"BB",title:"Board Briefing",desc:"Board-level risk summary"},{id:"implementation-guide",mark:"IG",title:"Implementation Guide",desc:"Step-by-step action plan"},{id:"compliance-checklist",mark:"CC",title:"Compliance Checklist",desc:"Actionable compliance items"},{id:"risk-register",mark:"RR",title:"Risk Register",desc:"Structured risk entries"},{id:"client-letter",mark:"CL",title:"Client Letter",desc:"Professional advice letter"},{id:"matter-update",mark:"SU",title:"Status Update",desc:"Internal matter update"},{id:"training-brief",mark:"TB",title:"Training Brief",desc:"Educational issues summary"}];function ge(o,s,i){const a=o instanceof ArrayBuffer?new Blob([o],{type:i}):new Blob([o],{type:i}),r=URL.createObjectURL(a),n=document.createElement("a");n.href=r,n.download=s,document.body.appendChild(n),n.click(),document.body.removeChild(n),URL.revokeObjectURL(r)}function bt(o,s){const i=Se.find(n=>n.id===o),a=(i==null?void 0:i.title)??o,r=[];if(r.push(`# ${a}`),r.push(""),r.push(`**Session:** ${s.sessionId}`),r.push(`**Date:** ${new Date().toLocaleDateString()}`),r.push(""),s.executiveSummary&&(r.push("## Summary"),r.push(""),r.push(s.executiveSummary),r.push("")),s.keyChanges.length>0){r.push("## Key Findings"),r.push("");for(const n of s.keyChanges)r.push(`### ${n.title}`),r.push(`- **Before:** ${n.before}`),r.push(`- **After:** ${n.after}`),r.push("")}if(s.debateResolutions.length>0){r.push("## Resolutions"),r.push("");for(const n of s.debateResolutions)r.push(`- **${n.topic}:** ${n.resolution}`);r.push("")}if(s.nextSteps.length>0){r.push("## Recommended Actions"),r.push("");for(const n of s.nextSteps)r.push(`- **${n.label}:** ${n.description}`);r.push("")}return r.push("---"),r.push(""),r.push("*Generated from AI-assisted analysis. Independent verification recommended.*"),r.join(`
`)}function vt({data:o,assemblyStatus:s}){const[i,a]=f.useState({}),[r,n]=f.useState({}),[c,m]=f.useState("elegant"),[d,p]=f.useState("docx"),h=o.sessionId.startsWith("demo-session"),C=!h&&s!=="ready",w=f.useRef(new Set);f.useEffect(()=>()=>{for(const g of w.current)clearTimeout(g);w.current.clear()},[]);const I=async g=>{a(T=>({...T,[g]:"generating"}));try{if(h){const y=bt(g,o),k=o.documentTitle.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"")||"document";ge(y,`${k}-${g}.md`,"text/markdown"),a(A=>({...A,[g]:"done"}));const b=setTimeout(()=>{w.current.delete(b),a(A=>({...A,[g]:"idle"}))},5e3);w.current.add(b);return}const T=await fetch(`/api/sessions/${o.sessionId}/derivatives`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({type:g,format:d,style:c})});if(!T.ok){const y=await T.json().catch(()=>({error:`Generation failed (${T.status})`})),k=y.error||`Generation failed (${T.status})`;throw console.error(`[DerivativesPanel] API error for ${g}: ${T.status}`,y),new Error(k)}const j=Se.find(y=>y.id===g),P=((j==null?void 0:j.title)??g).replace(/[^a-zA-Z0-9-_]/g,"-");if(d==="docx"){const y=await T.arrayBuffer();ge(y,`${o.sessionId}-${P}.docx`,"application/vnd.openxmlformats-officedocument.wordprocessingml.document")}else if(d==="html"){const y=await T.text();ge(y,`${o.sessionId}-${P}.html`,"text/html")}else{const y=await T.json();ge(y.content,`${o.sessionId}-${P}.md`,"text/markdown")}a(y=>({...y,[g]:"done"}));const L=setTimeout(()=>{w.current.delete(L),a(y=>({...y,[g]:"idle"}))},5e3);w.current.add(L)}catch(T){console.error(`[DerivativesPanel] Generation failed for ${g}:`,T);const j=T instanceof Error?T.message:"Generation failed";a(L=>({...L,[g]:"error"})),n(L=>({...L,[g]:j}));const P=setTimeout(()=>{w.current.delete(P),a(L=>({...L,[g]:"idle"})),n(L=>{const y={...L};return delete y[g],y})},8e3);w.current.add(P)}};return e.jsxs("div",{style:H.panel,children:[e.jsxs("div",{style:H.panelHeader,children:[e.jsx("div",{style:H.panelTitle,children:"Generate More"}),e.jsx("div",{style:H.panelSubtitle,children:"Create derivative documents from your analysis"})]}),e.jsxs("div",{style:H.selectorRow,children:[e.jsxs("div",{style:H.selectorGroup,children:[e.jsx("div",{style:H.selectorLabel,children:"Style"}),e.jsx("div",{style:H.pills,children:ft.map(g=>e.jsx("button",{onClick:()=>m(g.id),style:{...H.pill,...c===g.id?H.pillActive:{}},children:g.label},g.id))})]}),e.jsxs("div",{style:H.selectorGroup,children:[e.jsx("div",{style:H.selectorLabel,children:"Format"}),e.jsx("div",{style:H.pills,children:yt.map(g=>e.jsx("button",{onClick:()=>p(g.id),style:{...H.pill,...d===g.id?H.pillActive:{}},children:g.label},g.id))})]})]}),C&&e.jsx("div",{style:H.blockedWarning,children:s==="polling"?"Document is still being assembled — derivative generation will be available once assembly completes.":s==="timeout"?"Document assembly timed out. Retry assembly above, then generate derivatives.":s==="error"?"Document assembly failed. Retry assembly above, then generate derivatives.":"Primary work product is not ready — derivative generation is unavailable until document assembly completes."}),e.jsx("div",{style:H.grid,children:Se.map(g=>{const T=i[g.id]??"idle",j=T==="generating"||C&&T!=="error";return e.jsxs("button",{onClick:()=>I(g.id),disabled:j,style:{...H.card,...j?H.cardDisabled:{},...T==="done"?H.cardDone:{},...T==="error"?H.cardError:{}},onMouseEnter:P=>{j||(P.currentTarget.style.borderColor=t.text,P.currentTarget.style.transform="translateY(-1px)",P.currentTarget.style.boxShadow="0 4px 18px rgba(0,0,0,0.05)")},onMouseLeave:P=>{j||(P.currentTarget.style.borderColor=t.border,P.currentTarget.style.transform="translateY(0)",P.currentTarget.style.boxShadow="none")},children:[e.jsx("div",{style:H.cardMark,"aria-hidden":"true",children:g.mark}),e.jsxs("div",{style:H.cardBody,children:[e.jsx("div",{style:H.cardTitle,children:g.title}),e.jsx("div",{style:H.cardDesc,children:g.desc})]}),e.jsxs("div",{style:H.cardAction,children:[T==="idle"&&e.jsxs("span",{style:H.generateLabel,children:["Generate ","→"]}),T==="generating"&&e.jsxs("span",{style:H.generatingLabel,children:["Generating","…"]}),T==="done"&&e.jsxs("span",{style:H.doneLabel,children:["✓"," Done"]}),T==="error"&&e.jsxs("span",{style:H.errorLabel,title:r[g.id]||"Failed",children:["Retry ","→"]})]})]},g.id)})}),h&&e.jsx("div",{style:H.demoNote,children:"Demo mode: downloads a basic markdown template. Style and format options require a live session. Start an engagement for full DOCX output."})]})}const H={panel:{marginTop:l.xxl},panelHeader:{marginBottom:l.md},panelTitle:{fontSize:12,fontWeight:500,color:t.textMuted,textTransform:"uppercase",letterSpacing:.5},panelSubtitle:{fontSize:12,color:t.textDim,marginTop:4},selectorRow:{display:"flex",gap:l.xl,marginBottom:l.lg},selectorGroup:{display:"flex",flexDirection:"column",gap:l.xs},selectorLabel:{fontSize:10,fontWeight:500,color:t.textDim,fontFamily:u.sans,textTransform:"uppercase",letterSpacing:.5},pills:{display:"flex",gap:4},pill:{padding:"5px 12px",borderRadius:R.sm,border:`1px solid ${t.border}`,backgroundColor:t.bgCard,fontFamily:u.sans,fontSize:11,fontWeight:500,color:t.textSecondary,cursor:"pointer",transition:"background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease"},pillActive:{backgroundColor:t.text,color:"#fff",borderColor:t.text},grid:{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(260px, 1fr))",gap:l.sm},card:{display:"flex",alignItems:"center",gap:l.lg,padding:`${l.lg}px ${l.lg}px`,backgroundColor:t.bgCard,border:`1px solid ${t.border}`,borderRadius:R.md,cursor:"pointer",transition:"border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease",textAlign:"left",width:"100%"},cardDisabled:{opacity:.6,cursor:"default"},cardDone:{borderColor:t.success,backgroundColor:t.successBg},cardError:{borderColor:t.danger},cardMark:{flexShrink:0,width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:u.serif,fontSize:12,fontWeight:500,letterSpacing:1.2,color:t.accent,border:`1px solid ${t.border}`,borderRadius:"50%",backgroundColor:"transparent"},cardBody:{flex:1,minWidth:0},cardTitle:{fontSize:13,fontWeight:600,fontFamily:u.sans,color:t.text,letterSpacing:.2},cardDesc:{fontSize:11,fontFamily:u.sans,color:t.textMuted,lineHeight:1.5,marginTop:3},cardAction:{flexShrink:0},generateLabel:{fontSize:10,fontWeight:600,fontFamily:u.sans,color:t.accent,letterSpacing:1.2,textTransform:"uppercase"},generatingLabel:{fontSize:10,fontWeight:600,fontFamily:u.sans,color:t.textMuted,letterSpacing:1.2,textTransform:"uppercase"},doneLabel:{fontSize:10,fontWeight:600,fontFamily:u.sans,color:t.success,letterSpacing:1.2,textTransform:"uppercase"},errorLabel:{fontSize:10,fontWeight:600,fontFamily:u.sans,color:t.danger,letterSpacing:1.2,textTransform:"uppercase"},blockedWarning:{padding:`${l.md}px ${l.lg}px`,marginBottom:l.md,backgroundColor:"rgba(198, 160, 60, 0.08)",border:"1px solid rgba(198, 160, 60, 0.25)",borderRadius:R.sm,fontSize:12,fontFamily:u.sans,color:"rgb(140, 110, 30)",lineHeight:1.5},demoNote:{marginTop:l.md,fontSize:11,color:t.textDim,textAlign:"center"}},xt=[{label:"Tighten language",insert:'Tighten the language throughout — shorter sentences, fewer adverbs, drop hedging like "may" or "could." Keep the substance identical.'},{label:"More plain English",insert:"Rewrite in plainer English so a non-lawyer can follow it. Keep all defined terms and citations exactly as they are."},{label:"Add executive summary",insert:"Add a 3-4 sentence Executive Summary at the very top, before the existing first heading. Capture the headline finding, the recommendation, and the highest-priority risk."},{label:"Cite specific clauses",insert:'For every claim or finding, cite the specific clause number from the source document in parentheses, e.g. "(Clause 4.2)".'},{label:"More skeptical",insert:`Take a more skeptical posture on the counterparty's positions. Where the document accepts a clause as "standard," push harder — flag what could go wrong and what to negotiate.`}],me=8e3;function wt({sessionId:o,currentVersion:s,onClose:i,onRevised:a}){const[r,n]=f.useState(""),[c,m]=f.useState(!1),[d,p]=f.useState(null),[h,C]=f.useState(0),w=f.useRef(null),I=f.useRef(0),g=f.useRef(!0),T=f.useRef(null);f.useEffect(()=>{var A;(A=w.current)==null||A.focus()},[]),f.useEffect(()=>(g.current=!0,()=>{var A;g.current=!1;try{(A=T.current)==null||A.abort()}catch{}}),[]),f.useEffect(()=>{if(!c)return;I.current=Date.now();const A=setInterval(()=>C(Date.now()-I.current),250);return()=>clearInterval(A)},[c]),f.useEffect(()=>{const A=v=>{v.key==="Escape"&&!c&&i()};return window.addEventListener("keydown",A),()=>window.removeEventListener("keydown",A)},[c,i]);const j=A=>{var v;n(S=>S.trim()?S.trim()+`

`+A:A),(v=w.current)==null||v.focus()},P=async()=>{var v;const A=r.trim();if(!A){p("Add at least a sentence describing what to change.");return}if(A.length>me){p(`Notes are ${A.length.toLocaleString()} chars — keep it under ${me.toLocaleString()}.`);return}m(!0),p(null),C(0),(v=T.current)==null||v.abort(),T.current=new AbortController;try{const S=await fetch(`/api/sessions/${o}/revise`,{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify({instructions:A}),signal:T.current.signal});if(!S.ok){const E=await S.json().catch(()=>({}));throw new Error(E.error||E.details||`Server returned ${S.status}.`)}const F=await S.json();if(!g.current)return;a(F),i()}catch(S){if((S==null?void 0:S.name)==="AbortError"||!g.current)return;p(S instanceof Error?S.message:String(S)),m(!1)}},L=Math.floor(h/1e3),y=r.length,k=y>me,b=s+1;return e.jsxs("div",{style:O.backdrop,onClick:()=>!c&&i(),role:"dialog","aria-modal":"true","aria-labelledby":"revise-modal-title",children:[e.jsxs("div",{style:O.modal,onClick:A=>A.stopPropagation(),children:[e.jsxs("div",{style:O.header,children:[e.jsxs("div",{style:O.overline,children:["Partner Review · v",s," → v",b]}),e.jsx("h2",{id:"revise-modal-title",style:O.title,children:"Send back for revision"}),e.jsxs("p",{style:O.subtitle,children:["Mark up the draft. Your notes go to a senior associate who will produce v",b,", preserving everything you don't call out."]})]}),e.jsxs("div",{style:O.body,children:[!c&&e.jsx("div",{style:O.chipsRow,role:"group","aria-label":"Quick suggestions",children:xt.map(A=>e.jsxs("button",{type:"button",onClick:()=>j(A.insert),style:O.chip,disabled:c,children:["+ ",A.label]},A.label))}),e.jsx("textarea",{ref:w,value:r,onChange:A=>{n(A.target.value),d&&p(null)},placeholder:'e.g. "The Section 3 risk discussion buries the headline — lead with the cap exposure. Drop the long footnote on indemnification — it duplicates Section 5."',disabled:c,rows:10,style:{...O.textarea,borderColor:d?t.danger:k?t.danger:t.border,opacity:c?.6:1},"aria-label":"Partner's notes for revision"}),e.jsxs("div",{style:O.meta,children:[e.jsxs("span",{style:{...O.charCount,color:k?t.danger:t.textDim},children:[y.toLocaleString()," / ",me.toLocaleString()]}),e.jsx("span",{style:O.metaHint,children:"~$0.50 · 30-60s"})]}),d&&e.jsx("div",{style:O.errorBox,role:"alert",children:d}),c&&e.jsxs("div",{style:O.loadingBox,role:"status","aria-live":"polite",children:[e.jsx("div",{style:O.spinner}),e.jsxs("div",{style:O.loadingContent,children:[e.jsxs("div",{style:O.loadingTitle,children:["Producing v",b,"…"]}),e.jsxs("div",{style:O.loadingSub,children:["Reading your notes, preserving the rest verbatim · ",L,"s elapsed"]})]})]})]}),e.jsxs("div",{style:O.footer,children:[e.jsx("button",{type:"button",onClick:i,disabled:c,style:O.cancelBtn,children:"Cancel"}),e.jsx("button",{type:"button",onClick:P,disabled:c||k||!r.trim(),style:{...O.submitBtn,opacity:c||k||!r.trim()?.5:1,cursor:c||k||!r.trim()?"not-allowed":"pointer"},children:c?"Sending…":"Send to associate →"})]})]}),e.jsx("style",{children:`
        @keyframes revise-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `})]})}const O={backdrop:{position:"fixed",inset:0,backgroundColor:"rgba(20, 18, 14, 0.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1e3,padding:l.lg,backdropFilter:"blur(2px)"},modal:{backgroundColor:t.bg,border:`1px solid ${t.border}`,borderRadius:R.md,width:"100%",maxWidth:640,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 30px 80px rgba(0,0,0,0.25), 0 8px 24px rgba(0,0,0,0.12)"},header:{padding:`${l.xl}px ${l.xxl}px ${l.md}px`,borderBottom:`1px solid ${t.border}`},overline:{fontSize:10,fontWeight:600,fontFamily:u.sans,color:t.accent,letterSpacing:1.5,textTransform:"uppercase",marginBottom:l.sm},title:{fontSize:26,fontWeight:400,fontFamily:u.serif,color:t.text,margin:0,letterSpacing:-.3,lineHeight:1.2},subtitle:{fontSize:13,fontFamily:u.sans,color:t.textSecondary,lineHeight:1.6,margin:`${l.sm}px 0 0 0`},body:{padding:`${l.lg}px ${l.xxl}px ${l.lg}px`,display:"flex",flexDirection:"column",gap:l.md},chipsRow:{display:"flex",flexWrap:"wrap",gap:6},chip:{fontSize:11,fontFamily:u.sans,fontWeight:500,color:t.textSecondary,backgroundColor:t.bgPanel,border:`1px solid ${t.border}`,borderRadius:R.pill,padding:"5px 11px",cursor:"pointer",transition:"all 0.15s ease"},textarea:{width:"100%",fontSize:14,fontFamily:u.sans,lineHeight:1.6,color:t.text,backgroundColor:t.bgCard,border:`1px solid ${t.border}`,borderRadius:R.sm,padding:l.md,resize:"vertical",outline:"none",boxSizing:"border-box",transition:"border-color 0.15s ease"},meta:{display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:11,fontFamily:u.mono},charCount:{color:t.textDim},metaHint:{color:t.textDim},errorBox:{fontSize:13,fontFamily:u.sans,color:t.danger,backgroundColor:"rgba(196, 93, 62, 0.06)",border:"1px solid rgba(196, 93, 62, 0.25)",borderRadius:R.sm,padding:`${l.sm}px ${l.md}px`,lineHeight:1.5},loadingBox:{display:"flex",alignItems:"center",gap:l.md,padding:l.md,backgroundColor:t.accentLight,border:`1px solid ${t.accentMid}`,borderRadius:R.sm},spinner:{width:18,height:18,border:`2px solid ${t.accentMid}`,borderTopColor:t.accent,borderRadius:"50%",animation:"revise-spin 0.9s linear infinite",flexShrink:0},loadingContent:{flex:1,minWidth:0},loadingTitle:{fontSize:13,fontWeight:600,fontFamily:u.sans,color:t.text},loadingSub:{fontSize:11,fontFamily:u.sans,color:t.textDim,marginTop:2},footer:{padding:`${l.md}px ${l.xxl}px ${l.xl}px`,display:"flex",justifyContent:"flex-end",gap:l.sm,borderTop:`1px solid ${t.border}`},cancelBtn:{fontSize:13,fontFamily:u.sans,fontWeight:500,color:t.textSecondary,backgroundColor:"transparent",border:`1px solid ${t.border}`,borderRadius:R.sm,padding:"8px 18px",cursor:"pointer",minHeight:36},submitBtn:{fontSize:13,fontFamily:u.sans,fontWeight:600,color:"#fff",backgroundColor:t.accent,border:"none",borderRadius:R.sm,padding:"8px 22px",minHeight:36,transition:"opacity 0.15s ease"}},Re=o=>{try{return new Date(o).toLocaleString(void 0,{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}catch{return o}};function St({sessionId:o,onActiveDocumentChange:s}){var y,k;const[i,a]=f.useState([]),[r,n]=f.useState(null),[c,m]=f.useState(!1),[d,p]=f.useState(!1),[h,C]=f.useState(null),w=o.startsWith("demo-session"),I=f.useCallback(async()=>{if(!w)try{const b=await fetch(`/api/sessions/${o}/revisions`,{credentials:"include"});if(!b.ok)return;const v=(await b.json()).revisions??[];a(v)}catch{}},[o,w]);f.useEffect(()=>{I()},[I]);const g=f.useCallback(async b=>{p(!0),C(null);try{const A=await fetch(`/api/sessions/${o}/revisions/${b}`,{credentials:"include"});if(!A.ok)throw new Error(`Could not load v${b}.`);const v=await A.json();n(b),s(v.document,b)}catch(A){C(A instanceof Error?A.message:String(A))}finally{p(!1)}},[o,s]),T=f.useCallback(()=>{n(null),s(null,null)},[s]),j=f.useCallback(b=>{a(A=>{const v=[...A];return v.some(S=>S.version===1)||v.push({version:1,instructions:"",createdAt:b.createdAt,costUsd:0,chars:0}),v.push({version:b.version,instructions:b.instructions,createdAt:b.createdAt,costUsd:b.costUsd,chars:b.document.length}),v.sort((S,F)=>S.version-F.version)}),n(b.version),s(b.document,b.version),I()},[s,I]);if(w)return null;const P=i.length>0?Math.max(...i.map(b=>b.version)):1,L=i.some(b=>b.version>1);return e.jsxs("div",{style:_.wrap,children:[e.jsxs("div",{style:_.row,children:[e.jsxs("div",{style:_.pills,role:"tablist","aria-label":"Document revisions",children:[L&&e.jsxs(e.Fragment,{children:[e.jsx("button",{role:"tab","aria-selected":r===null,onClick:T,style:{..._.pill,...r===null?_.pillActive:{}},disabled:d,children:"Original (v1)"}),i.filter(b=>b.version>1).map(b=>e.jsxs("button",{role:"tab","aria-selected":r===b.version,onClick:()=>g(b.version),style:{..._.pill,...r===b.version?_.pillActive:{}},title:b.instructions?`${b.instructions.slice(0,200)}${b.instructions.length>200?"…":""}

${Re(b.createdAt)}`:Re(b.createdAt),disabled:d,children:["v",b.version]},b.version))]}),d&&e.jsx("span",{style:_.loadingTag,children:"Loading…"})]}),e.jsxs("button",{type:"button",onClick:()=>m(!0),style:_.sendBackBtn,"aria-label":"Send the work product back for revision",children:["Send back for revision ",e.jsx("span",{style:_.sendBackArrow,children:"→"})]})]}),h&&e.jsx("div",{style:_.errorRow,role:"alert",children:h}),r&&r>1&&e.jsxs("div",{style:_.activeNote,children:[e.jsxs("span",{style:_.activeNoteLabel,children:["Viewing v",r]}),e.jsx("span",{style:_.activeNoteSep,children:"·"}),e.jsxs("span",{style:_.activeNoteText,children:[(y=i.find(b=>b.version===r))==null?void 0:y.instructions.slice(0,140),(((k=i.find(b=>b.version===r))==null?void 0:k.instructions.length)??0)>140&&"…"]})]}),c&&e.jsx(wt,{sessionId:o,currentVersion:P,onClose:()=>m(!1),onRevised:j})]})}const _={wrap:{marginTop:l.lg,marginBottom:l.lg,display:"flex",flexDirection:"column",gap:l.sm},row:{display:"flex",justifyContent:"space-between",alignItems:"center",gap:l.md,flexWrap:"wrap"},pills:{display:"flex",flexWrap:"wrap",gap:6,alignItems:"center"},pill:{fontSize:11,fontFamily:u.sans,fontWeight:500,color:t.textSecondary,backgroundColor:t.bgCard,border:`1px solid ${t.border}`,borderRadius:R.pill,padding:"5px 12px",cursor:"pointer",transition:"all 0.15s ease"},pillActive:{color:"#fff",backgroundColor:t.accent,borderColor:t.accent},loadingTag:{fontSize:11,fontFamily:u.mono,color:t.textDim,marginLeft:l.sm},sendBackBtn:{fontSize:12,fontFamily:u.sans,fontWeight:600,color:t.text,backgroundColor:"transparent",border:`1px solid ${t.borderSelected}`,borderRadius:R.sm,padding:"7px 16px",cursor:"pointer",minHeight:34,transition:"all 0.15s ease",display:"inline-flex",alignItems:"center",gap:6},sendBackArrow:{color:t.accent,fontSize:14,lineHeight:1},errorRow:{fontSize:12,fontFamily:u.sans,color:t.danger},activeNote:{fontSize:11,fontFamily:u.sans,color:t.textDim,display:"flex",gap:6,alignItems:"baseline"},activeNoteLabel:{fontWeight:600,color:t.accent},activeNoteSep:{opacity:.5},activeNoteText:{flex:1,minWidth:0}},Ct=1,je=6;function Tt({agents:o,defaultTitle:s,onClose:i}){const[a,r]=f.useState(""),[n,c]=f.useState(s??"My Team"),[m,d]=f.useState(!1),[p,h]=f.useState(null),[C,w]=f.useState(!1),I=o.slice(0,je),g=I.length>=Ct,T=Math.max(0,o.length-je),j=a?`${window.location.origin}/#/t/${a}`:"",P=a?`/api/teams/share/${a}/og.png`:"",L=I.length===1?`Meet my team on Lavern. Just ${I[0].displayName} for now.`:`Meet my ${I.length}-person team on Lavern.`,y=a?`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(j)}`:"",k=f.useCallback(async()=>{d(!0),h(null);try{const S=I.map($=>({displayName:$.displayName,tagline:$.tagline,category:$.category,seniority:$.seniority,costTier:$.costTier,billingRateUsd:$.billingRateUsd,skills:$.skills,personality:{archetype:$.personality.archetype,traits:$.personality.traits??{},workStyle:$.personality.workStyle},practiceAreas:$.practiceAreas??[],strengths:$.strengths??[],limitations:$.limitations??[],avatarSeed:$.avatarSeed})),F=await fetch("/api/teams/share",{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify({agents:S,title:n.trim()||void 0})});if(!F.ok){const $=await F.text();throw new Error(`HTTP ${F.status}${$?`: ${$.slice(0,200)}`:""}`)}const E=await F.json();r(E.token)}catch(S){h(S instanceof Error?S.message:"Share failed")}finally{d(!1)}},[I,n]),b=f.useCallback(async()=>{if(a&&confirm('Revoke the share link? Anyone with the URL will see "not found".')){d(!0);try{const S=await fetch(`/api/teams/share/${encodeURIComponent(a)}`,{method:"DELETE",credentials:"include"});if(!S.ok)throw new Error(`HTTP ${S.status}`);r("")}catch(S){h(S instanceof Error?S.message:"Revoke failed")}finally{d(!1)}}},[a]),A=f.useCallback(async()=>{await navigator.clipboard.writeText(j),w(!0),setTimeout(()=>w(!1),1600)},[j]),v=f.useCallback(async()=>{await navigator.clipboard.writeText(`${L}
${j}`),w(!0),setTimeout(()=>w(!1),1600)},[L,j]);return e.jsx("div",{style:z.backdrop,onClick:i,children:e.jsxs("div",{style:z.modal,onClick:S=>S.stopPropagation(),children:[e.jsx("button",{onClick:i,style:z.closeBtn,"aria-label":"Close",children:"×"}),e.jsxs("div",{style:z.header,children:[e.jsx("div",{style:z.title,children:"Share your team"}),e.jsx("div",{style:z.sub,children:a?`${I.length} agent${I.length===1?"":"s"} on the lineup. Share on LinkedIn, copy a link, or revoke any time.`:`One image, all ${I.length} member${I.length===1?"":"s"}. Front cards only — clean and shareable.`}),T>0&&e.jsxs("div",{style:z.warning,children:["The card shows the first 6 of ",o.length," members."]})]}),e.jsx("div",{style:z.chipsWrap,children:I.map((S,F)=>e.jsxs("div",{style:z.memberChip,children:[e.jsx("div",{style:z.chipName,children:S.displayName}),e.jsxs("div",{style:z.chipMeta,children:[S.seniority," · ",S.category]})]},F))}),!a&&e.jsxs("div",{style:z.titleRow,children:[e.jsx("label",{htmlFor:"share-team-title",style:z.titleLabel,children:"Card title (optional)"}),e.jsx("input",{id:"share-team-title",value:n,onChange:S=>c(S.target.value),placeholder:"e.g. Fund Formation Squad",maxLength:120,style:z.titleInput})]}),a&&e.jsxs("div",{style:z.previewWrap,children:[e.jsx("img",{src:P,alt:"Team share card preview",style:z.preview,onError:S=>{S.target.style.display="none"}}),e.jsx("div",{style:z.previewLabel,children:"This is what LinkedIn shows."})]}),!a&&e.jsx("button",{onClick:k,disabled:m||!g,style:{...z.generateBtn,opacity:m||!g?.5:1},children:m?"Rendering card…":"Generate share card →"}),a&&e.jsxs(e.Fragment,{children:[e.jsxs("div",{style:z.urlRow,children:[e.jsx("input",{value:j,readOnly:!0,style:z.urlInput,onFocus:S=>S.target.select()}),e.jsx("button",{onClick:A,style:z.copyBtn,children:C?"Copied":"Copy"})]}),e.jsxs("div",{style:z.copyTextSection,children:[e.jsx("div",{style:z.copyTextLabel,children:"Suggested LinkedIn text"}),e.jsx("div",{style:z.copyTextBox,children:L}),e.jsx("button",{onClick:v,style:z.smallBtn,children:C?"Copied":"Copy text + link"})]}),e.jsxs("div",{style:z.actions,children:[e.jsx("a",{href:y,target:"_blank",rel:"noopener noreferrer",style:z.linkedInBtn,children:"Share on LinkedIn →"}),e.jsx("button",{onClick:b,disabled:m,style:z.revokeBtn,children:"Revoke link"})]})]}),p&&e.jsx("div",{style:z.error,children:p})]})})}const z={backdrop:{position:"fixed",inset:0,background:"rgba(8,6,4,0.72)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1e3,padding:24},modal:{background:"#1A140A",color:"#F5EFDF",borderRadius:R.md,padding:"32px 32px 28px",width:"100%",maxWidth:600,maxHeight:"92vh",overflowY:"auto",border:"1px solid rgba(232,132,92,0.2)",boxShadow:"0 24px 64px rgba(0,0,0,0.5)",position:"relative",display:"flex",flexDirection:"column",gap:20},closeBtn:{position:"absolute",top:12,right:14,background:"transparent",border:"none",color:"rgba(245,239,223,0.55)",fontSize:28,cursor:"pointer",padding:4,lineHeight:1},header:{display:"flex",flexDirection:"column",gap:6},title:{fontFamily:u.serif,fontSize:28,fontWeight:500,color:"#FAF7F0"},sub:{fontSize:13,color:"rgba(245,239,223,0.6)",lineHeight:1.5},warning:{fontSize:11,color:"#E8845C",marginTop:4},chipsWrap:{display:"flex",flexWrap:"wrap",gap:8,padding:"12px 14px",background:"rgba(245,239,223,0.04)",border:"1px solid rgba(245,239,223,0.08)",borderRadius:6},memberChip:{display:"flex",flexDirection:"column",gap:2,padding:"6px 10px",background:"rgba(232,132,92,0.06)",borderRadius:4,border:"1px solid rgba(232,132,92,0.18)"},chipName:{fontSize:12,color:"#F5EFDF",fontWeight:500},chipMeta:{fontSize:9,color:"rgba(245,239,223,0.5)",textTransform:"uppercase",letterSpacing:.6,fontWeight:600},titleRow:{display:"flex",flexDirection:"column",gap:6},titleLabel:{fontSize:10,letterSpacing:1.4,textTransform:"uppercase",color:"rgba(245,239,223,0.55)",fontWeight:600},titleInput:{padding:"10px 12px",background:"#0E0A06",color:"#F5EFDF",border:"1px solid rgba(245,239,223,0.15)",borderRadius:4,fontSize:14,fontFamily:u.sans},previewWrap:{display:"flex",flexDirection:"column",gap:6},preview:{width:"100%",borderRadius:R.sm,display:"block",border:"1px solid rgba(232,132,92,0.15)"},previewLabel:{fontSize:10,letterSpacing:1.4,textTransform:"uppercase",color:"rgba(245,239,223,0.4)",textAlign:"center"},generateBtn:{background:"#E8845C",color:"#1A140A",padding:"14px 22px",fontSize:13,letterSpacing:1.5,textTransform:"uppercase",fontWeight:700,border:"none",borderRadius:4,cursor:"pointer"},urlRow:{display:"flex",gap:8},urlInput:{flex:1,padding:"10px 12px",background:"#0E0A06",color:"#F5EFDF",border:"1px solid rgba(245,239,223,0.15)",borderRadius:4,fontFamily:u.mono,fontSize:12},copyBtn:{background:"transparent",color:"#F5EFDF",border:"1px solid rgba(245,239,223,0.25)",borderRadius:4,padding:"0 16px",fontSize:11,letterSpacing:1,textTransform:"uppercase",cursor:"pointer",minWidth:80},copyTextSection:{display:"flex",flexDirection:"column",gap:6,padding:"12px 14px",background:"rgba(232,132,92,0.06)",borderRadius:4,border:"1px solid rgba(232,132,92,0.15)"},copyTextLabel:{fontSize:9,letterSpacing:1.4,textTransform:"uppercase",color:"#E8845C",fontWeight:600},copyTextBox:{fontSize:14,color:"#F5EFDF",lineHeight:1.5},smallBtn:{alignSelf:"flex-start",marginTop:4,background:"transparent",color:"#E8845C",border:"none",cursor:"pointer",fontSize:11,letterSpacing:1,textTransform:"uppercase",padding:"4px 0"},actions:{display:"flex",gap:10,flexWrap:"wrap",paddingTop:6},linkedInBtn:{flex:"1 0 auto",background:"#0A66C2",color:"white",padding:"11px 18px",textDecoration:"none",fontSize:12,letterSpacing:1.2,textTransform:"uppercase",fontWeight:600,borderRadius:4,textAlign:"center"},revokeBtn:{background:"transparent",color:"rgba(245,239,223,0.55)",border:"1px solid rgba(245,239,223,0.15)",borderRadius:4,padding:"11px 18px",cursor:"pointer",fontSize:12,letterSpacing:1.2,textTransform:"uppercase"},error:{padding:"10px 14px",background:"rgba(196,93,62,0.12)",border:"1px solid rgba(196,93,62,0.35)",borderRadius:4,fontSize:12,color:"#FFB3A1"}},At={bodyFont:"'Times New Roman', Times, Georgia, serif",headingFont:"'Times New Roman', Times, Georgia, serif",ink:"#000000",inkSecondary:"#000000",inkMuted:"#333333",accent:"#1B2A4A",border:"#AAAAAA",borderLight:"#CCCCCC",paper:"#F5F5F5",h1Size:16,h2Size:14,h3Size:12,bodySize:12,lineHeight:1.15,letterSpacing:0,headingNumbered:!0,h1Bold:!0,h2Bold:!0,h3Bold:!0,h3Uppercase:!1,tableBorderStyle:"full",tableAlternatingRows:!0,tableHeaderBg:"#F0F0F0",blockquoteStyle:"left-bar",linkUnderline:!1},Le={bodyFont:"'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",headingFont:"'Newsreader', Georgia, serif",fontImport:"https://fonts.googleapis.com/css2?family=Newsreader:wght@300;400;500;600;700;800&family=Geist:wght@400;500;600;700&display=swap",ink:"#1A1A1A",inkSecondary:"#4A4A4A",inkMuted:"#7A7A76",accent:"#C45D3E",border:"#E5E3DD",borderLight:"#F0EFEB",paper:"#FAFAF8",h1Size:22,h2Size:16,h3Size:13,bodySize:10.5,lineHeight:1.7,letterSpacing:0,headingNumbered:!1,h1Bold:!1,h2Bold:!1,h3Bold:!0,h3Uppercase:!0,tableBorderStyle:"open",tableAlternatingRows:!1,tableHeaderBg:"#FAFAF8",blockquoteStyle:"filled",linkUnderline:!1},kt={bodyFont:"Arial, Verdana, 'Helvetica Neue', sans-serif",headingFont:"Verdana, Arial, 'Helvetica Neue', sans-serif",ink:"#000000",inkSecondary:"#1A1A1A",inkMuted:"#333333",accent:"#0000CC",border:"#767676",borderLight:"#AAAAAA",paper:"#F2F2F2",h1Size:24,h2Size:20,h3Size:16,bodySize:12,lineHeight:1.5,letterSpacing:.12,headingNumbered:!1,h1Bold:!0,h2Bold:!0,h3Bold:!0,h3Uppercase:!1,tableBorderStyle:"full",tableAlternatingRows:!1,tableHeaderBg:"#E0E0E0",blockquoteStyle:"left-bar",linkUnderline:!0},Pt={traditional:At,elegant:Le,accessible:kt};function se(o,s){const i=[],a=/(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`|\[([^\]]+)\]\(([^)]+)\))/g;let r=0,n;for(;(n=a.exec(o))!==null;)n.index>r&&i.push(o.slice(r,n.index)),n[2]?i.push(e.jsx("strong",{children:n[2]},n.index)):n[3]?i.push(e.jsx("span",{children:n[3]},n.index)):n[4]?i.push(e.jsx("code",{style:{fontFamily:"Consolas, monospace",fontSize:"0.9em",background:s.borderLight,padding:"1px 5px",borderRadius:3,letterSpacing:0},children:n[4]},n.index)):n[5]&&n[6]&&i.push(e.jsx("a",{href:n[6],target:"_blank",rel:"noopener noreferrer",style:{color:s.accent,textDecoration:s.linkUnderline?"underline":"none",borderBottom:s.linkUnderline?"none":`1px solid ${s.accent}55`},children:n[5]},n.index)),r=n.index+n[0].length;return r<o.length&&i.push(o.slice(r)),i.length>0?i:[o]}function Rt(o,s){const i=o.filter(d=>!d.match(/^\s*\|[-:\s|]+\|\s*$/)).map(d=>d.split("|").map(p=>p.trim()).filter(p=>p.length>0));if(i.length===0)return null;const[a,...r]=i,n=s.tableBorderStyle==="open",c={textAlign:"left",fontFamily:s.headingFont,fontWeight:600,fontSize:s.bodySize*.9,color:s.ink,padding:"8px 12px",background:s.tableHeaderBg,borderBottom:n?`2px solid ${s.accent}`:`1px solid ${s.border}`,borderRight:n?"none":`1px solid ${s.border}`},m=d=>({padding:"7px 12px",fontSize:s.bodySize*.9,color:s.inkSecondary,borderBottom:`1px solid ${s.borderLight}`,borderRight:n?"none":`1px solid ${s.borderLight}`,background:s.tableAlternatingRows&&d%2===1?"#F8F8F8":"transparent"});return e.jsx("div",{style:{overflowX:"auto",margin:"12px 0"},children:e.jsxs("table",{style:{width:"100%",borderCollapse:"collapse",border:n?"none":`1px solid ${s.border}`},children:[e.jsx("thead",{children:e.jsx("tr",{children:a.map((d,p)=>e.jsx("th",{style:c,children:se(d,s)},p))})}),r.length>0&&e.jsx("tbody",{children:r.map((d,p)=>e.jsx("tr",{children:d.map((h,C)=>e.jsx("td",{style:m(p),children:se(h,s)},C))},p))})]})})}function ye(o){return/^[-*+]\s/.test(o)}let de=0,ue=0,he=0;function jt({content:o,docStyle:s="elegant"}){const i=Pt[s];de=0,ue=0,he=0;const a=o.split(`
`),r=[];let n=0;for(;n<a.length;){const c=a[n],m=c.match(/^(#{1,6})\s+(.+)/);if(m){const p=m[1].length,h=m[2];if(p===1){i.headingNumbered&&de++,ue=0,he=0;const C=i.headingNumbered?`${de}.  ${h}`:h;r.push(e.jsx("div",{style:{fontFamily:i.headingFont,fontSize:i.h1Size,fontWeight:i.h1Bold?700:300,color:i.ink,lineHeight:1.15,letterSpacing:i.headingNumbered?0:-.3,marginTop:28,marginBottom:10,paddingBottom:8,borderBottom:i.headingNumbered?`2px double ${i.accent}`:`1px solid ${i.border}`},children:C},n))}else if(p===2){i.headingNumbered&&ue++,he=0;const C=i.headingNumbered?`${de}.${ue}  ${h}`:h;r.push(e.jsx("div",{style:{fontFamily:i.headingFont,fontSize:i.h2Size,fontWeight:i.h2Bold?700:400,color:i.h2Bold?i.ink:i.accent,lineHeight:1.2,marginTop:22,marginBottom:8,borderLeft:!i.headingNumbered&&!i.h2Bold?`3px solid ${i.accent}`:"none",paddingLeft:!i.headingNumbered&&!i.h2Bold?10:0},children:C},n))}else if(p===3){i.headingNumbered&&he++;const C=i.headingNumbered?`${de}.${ue}.${he}  ${h}`:h;r.push(e.jsx("div",{style:{fontFamily:i.headingFont,fontSize:i.h3Size,fontWeight:i.h3Bold?700:400,color:i.inkSecondary,lineHeight:1.3,letterSpacing:i.h3Uppercase?"0.1em":0,textTransform:i.h3Uppercase?"uppercase":"none",marginTop:18,marginBottom:6},children:C},n))}else r.push(e.jsx("div",{style:{fontFamily:i.headingFont,fontSize:i.h3Size*.9,fontWeight:600,color:i.inkMuted,marginTop:12,marginBottom:4},children:h},n));n++;continue}if(/^---+$/.test(c.trim())||/^\*\*\*+$/.test(c.trim())){r.push(e.jsx("hr",{style:{border:"none",borderTop:`1px solid ${i.border}`,margin:"16px 0"}},n)),n++;continue}if(c.trim().startsWith("```")){n++;const p=[];for(;n<a.length&&!a[n].trim().startsWith("```");)p.push(a[n]),n++;n<a.length&&n++,r.push(e.jsx("pre",{style:{fontFamily:"Consolas, monospace",fontSize:11,lineHeight:1.6,background:i.borderLight,border:`1px solid ${i.border}`,borderRadius:4,padding:"12px 16px",overflow:"auto",margin:"10px 0",whiteSpace:"pre",color:i.ink,letterSpacing:0},children:e.jsx("code",{children:p.join(`
`)})},`code-${n}`));continue}if(c.trim().startsWith(">")){const p=[];for(;n<a.length&&a[n].trim().startsWith(">");)p.push(a[n].trim().replace(/^>\s*/,"")),n++;const h=i.blockquoteStyle==="filled"?{background:`${i.accent}10`,border:"none",borderLeft:`3px solid ${i.accent}`,borderRadius:4,padding:"10px 14px",color:i.inkSecondary,margin:"10px 0",fontStyle:"normal"}:{borderLeft:`3px solid ${i.accent}`,paddingLeft:14,color:i.inkMuted,margin:"10px 0"};r.push(e.jsx("blockquote",{style:h,children:se(p.join(" "),i)},`bq-${n}`));continue}if(c.trim().startsWith("|")){const p=[];for(;n<a.length&&a[n].trim().startsWith("|");)p.push(a[n]),n++;r.push(e.jsx("div",{children:Rt(p,i)},`table-${n}`));continue}if(ye(c)){const p=[];for(;n<a.length&&ye(a[n]);)p.push(a[n].replace(/^[-*+]\s+/,"")),n++;r.push(e.jsx("ul",{style:{margin:"6px 0 10px",paddingLeft:0,listStyle:"none"},children:p.map((h,C)=>e.jsxs("li",{style:{display:"flex",gap:10,alignItems:"baseline",marginBottom:4,fontSize:i.bodySize,color:i.inkSecondary,lineHeight:i.lineHeight,letterSpacing:i.letterSpacing,fontFamily:i.bodyFont},children:[e.jsx("span",{style:{color:i.accent,flexShrink:0,fontSize:i.bodySize*.8},children:i.headingNumbered?"—":i.blockquoteStyle==="filled"?"◆":"→"}),e.jsx("span",{children:se(h,i)})]},C))},`ul-${n}`));continue}if(/^\d+\.\s/.test(c)){const p=[];for(;n<a.length&&/^\d+\.\s/.test(a[n]);)p.push(a[n].replace(/^\d+\.\s/,"")),n++;r.push(e.jsx("ol",{style:{margin:"6px 0 10px",paddingLeft:20},children:p.map((h,C)=>e.jsx("li",{style:{marginBottom:4,fontSize:i.bodySize,color:i.inkSecondary,lineHeight:i.lineHeight,letterSpacing:i.letterSpacing,fontFamily:i.bodyFont},children:se(h,i)},C))},`ol-${n}`));continue}if(c.trim()===""){n++;continue}const d=[];for(;n<a.length&&a[n].trim()!==""&&!a[n].match(/^#{1,6}\s/)&&!ye(a[n])&&!a[n].trim().startsWith("|")&&!a[n].trim().startsWith(">")&&!a[n].trim().startsWith("```")&&!/^---+$/.test(a[n].trim())&&!/^\*\*\*+$/.test(a[n].trim())&&!/^\d+\.\s/.test(a[n]);)d.push(a[n]),n++;d.length>0&&r.push(e.jsx("p",{style:{margin:"0 0 10px",fontSize:i.bodySize,fontFamily:i.bodyFont,color:i.inkSecondary,lineHeight:i.lineHeight,letterSpacing:i.letterSpacing},children:se(d.join(" "),i)},`p-${n}`))}return e.jsxs(e.Fragment,{children:[s==="elegant"&&e.jsx("link",{rel:"stylesheet",href:Le.fontImport}),e.jsx("div",{style:{fontSize:i.bodySize,fontFamily:i.bodyFont,color:i.ink,lineHeight:i.lineHeight,letterSpacing:i.letterSpacing,background:i.paper,padding:"24px 28px",borderRadius:6},children:r})]})}function It({data:o,assemblyStatus:s,onRetryAssembly:i}){const[a,r]=f.useState("elegant"),[n,c]=f.useState(null),[m,d]=f.useState(null),[p,h]=f.useState(!1),{allProfiles:C}=He(),w=f.useMemo(()=>{const P=new Map(C.map(y=>[y.role,y]));return(o.agentPerformance??[]).map(y=>y.role).map(y=>P.get(y)).filter(y=>!!y).filter(y=>y.category==="lawyer"||y.category==="specialist").slice(0,6)},[C,o.agentPerformance]),I=w.length>0&&!o.sessionId.startsWith("demo-session"),g=n??o.finalOutput,T=s==="ready"&&g.length>100,j=s==="timeout"||s==="error";return e.jsxs("div",{children:[e.jsxs("div",{style:N.heroSection,children:[e.jsx("div",{style:N.heroOverline,children:"Delivered Work Product"}),e.jsx("h2",{style:N.heroTitle,children:o.documentTitle}),e.jsx("div",{style:N.heroDivider})]}),j&&!o.sessionId.startsWith("demo-session")&&e.jsxs("div",{style:N.assemblyFailedNotice,children:[e.jsx("div",{style:N.assemblyFailedIcon,children:"⚠"}),e.jsxs("div",{style:N.assemblyFailedContent,children:[e.jsx("div",{style:N.assemblyFailedTitle,children:"Document assembly did not complete"}),e.jsx("div",{style:N.assemblyFailedBody,children:"The agents completed their analysis, but the final document could not be assembled. You can retry assembly, or download the structured analysis data (JSON) which contains all findings, debate resolutions, and recommendations."}),i&&e.jsx("button",{onClick:i,style:N.assemblyFailedRetry,children:"Retry Assembly"})]})]}),e.jsx(St,{sessionId:o.sessionId,onActiveDocumentChange:(P,L)=>{c(P),d(L)}}),I&&e.jsxs("div",{style:N.shareTeamRow,children:[e.jsxs("div",{style:N.shareTeamHint,children:[e.jsx("span",{style:N.shareTeamLabel,children:"Your lineup"}),e.jsx("span",{style:N.shareTeamMembers,children:w.map(P=>P.displayName).join(" · ")})]}),e.jsxs("button",{type:"button",onClick:()=>h(!0),style:N.shareTeamBtn,"aria-label":"Share your team as a card",children:["Share your team ",e.jsx("span",{style:N.shareTeamArrow,children:"→"})]})]}),p&&e.jsx(Tt,{agents:w,defaultTitle:o.documentTitle,onClose:()=>h(!1)}),T&&e.jsxs("div",{style:N.previewSection,children:[e.jsxs("div",{style:N.sectionHeader,children:[e.jsxs("div",{style:N.sectionTitle,children:["Document Preview",m?` · v${m}`:""]}),e.jsxs("div",{style:N.sectionCount,children:[g.length.toLocaleString()," chars"]})]}),e.jsxs("div",{style:N.previewCard,children:[o.sessionId.startsWith("demo-session")&&e.jsx("div",{style:N.mockBanner,children:"MOCK DOCUMENT"}),e.jsx(jt,{docStyle:a,content:g.substring(0,5e3)+(g.length>5e3?`

---

*... download full document below*`:"")})]})]}),e.jsxs("div",{style:N.summarySection,children:[e.jsx("div",{style:N.summaryQuoteMark,children:"“"}),e.jsx("p",{style:N.summaryText,children:o.executiveSummary}),e.jsx("div",{style:N.summaryLabel,children:"Analysis Summary"})]}),e.jsx(gt,{data:o,assemblyStatus:s,onRetry:i,selectedStyle:a,onStyleChange:r}),!o.sessionId.startsWith("demo-session")&&e.jsx(vt,{data:o,assemblyStatus:s})]})}const N={shareTeamRow:{display:"flex",justifyContent:"space-between",alignItems:"center",gap:l.md,marginBottom:l.lg,padding:`${l.sm}px ${l.md}px`,background:t.bgPanel,border:`1px solid ${t.border}`,borderRadius:R.sm,flexWrap:"wrap"},shareTeamHint:{display:"flex",flexDirection:"column",gap:2,minWidth:0},shareTeamLabel:{fontSize:9,fontWeight:700,fontFamily:u.sans,color:t.accent,letterSpacing:1.5,textTransform:"uppercase"},shareTeamMembers:{fontSize:12,fontFamily:u.sans,color:t.textSecondary,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:600},shareTeamBtn:{fontSize:12,fontFamily:u.sans,fontWeight:600,color:t.text,backgroundColor:"transparent",border:`1px solid ${t.borderSelected}`,borderRadius:R.sm,padding:"7px 16px",cursor:"pointer",minHeight:34,transition:"all 0.15s ease",display:"inline-flex",alignItems:"center",gap:6},shareTeamArrow:{color:t.accent,fontSize:14,lineHeight:1},heroSection:{textAlign:"center",marginBottom:l.xxl},heroOverline:{fontSize:10,fontWeight:600,fontFamily:u.sans,color:t.accent,letterSpacing:2,textTransform:"uppercase",marginBottom:12},heroTitle:{fontSize:36,fontWeight:300,fontFamily:u.serif,color:t.text,margin:0,letterSpacing:-.5,lineHeight:1.2},heroDivider:{width:48,height:1,backgroundColor:t.accent,margin:"20px auto 0",opacity:.5},summarySection:{position:"relative",backgroundColor:t.bgCard,border:`1px solid ${t.border}`,borderRadius:R.sm,padding:"36px 40px 28px",marginBottom:l.xxl},summaryQuoteMark:{position:"absolute",top:12,left:24,fontSize:48,fontFamily:u.serif,fontWeight:300,color:t.accent,opacity:.25,lineHeight:1,userSelect:"none"},summaryText:{fontSize:14,lineHeight:1.8,color:t.textSecondary,fontFamily:u.sans,fontWeight:400,margin:0},summaryLabel:{fontSize:9,fontWeight:600,fontFamily:u.sans,color:t.textDim,letterSpacing:1.5,textTransform:"uppercase",marginTop:20,textAlign:"right"},assemblyFailedNotice:{display:"flex",gap:16,padding:"20px 24px",backgroundColor:"rgba(180, 60, 60, 0.04)",border:"1px solid rgba(180, 60, 60, 0.2)",borderRadius:R.sm,marginBottom:l.xxl},assemblyFailedIcon:{fontSize:24,flexShrink:0,lineHeight:1},assemblyFailedContent:{flex:1},assemblyFailedTitle:{fontSize:14,fontWeight:600,fontFamily:u.sans,color:t.text,marginBottom:8},assemblyFailedBody:{fontSize:13,fontFamily:u.sans,color:t.textSecondary,lineHeight:1.6,marginBottom:12},assemblyFailedRetry:{padding:"6px 16px",fontSize:12,fontWeight:600,fontFamily:u.sans,color:"#fff",backgroundColor:t.accent,border:"none",borderRadius:R.sm,cursor:"pointer",transition:"opacity 0.15s ease"},previewSection:{marginTop:l.xxl,marginBottom:l.xxl},previewCard:{backgroundColor:t.bgCard,border:`1px solid ${t.border}`,borderRadius:R.sm,padding:l.xl,maxHeight:600,overflow:"auto"},mockBanner:{display:"inline-block",fontSize:9,fontWeight:700,fontFamily:u.sans,letterSpacing:2,textTransform:"uppercase",color:t.textDim,border:`1px solid ${t.border}`,borderRadius:2,padding:"3px 8px",marginBottom:20},sectionHeader:{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:l.lg},sectionTitle:{fontSize:13,fontWeight:600,fontFamily:u.sans,color:t.text,letterSpacing:.5,textTransform:"uppercase"},sectionCount:{fontSize:11,fontFamily:u.sans,color:t.textDim}};function Dt({confidence:o,dimensionCount:s,flaggedItems:i,confidenceIntervals:a,disclaimer:r}){const n=Math.round(o*100),c=o>0&&s>0;return e.jsxs("div",{style:te.container,"data-testid":"human-review-section",children:[e.jsx("h3",{style:te.heading,children:"What If This Advice Is Wrong?"}),e.jsx("p",{style:te.statement,children:c?e.jsxs(e.Fragment,{children:["This analysis scores ",e.jsxs("strong",{children:[n,"% certainty"]})," across ",s," verification dimension",s!==1?"s":"","."]}):e.jsx(e.Fragment,{children:"This analysis has not yet been scored against formal verification dimensions. We recommend independent review."})}),i.length>0&&e.jsxs("div",{style:te.flaggedSection,children:[e.jsx("span",{style:te.flaggedLabel,children:"Areas flagged for human review:"}),e.jsx("ul",{style:te.flaggedList,children:i.map((m,d)=>e.jsxs("li",{style:te.flaggedItem,children:[e.jsx("span",{style:te.flaggedDot}),m]},d))})]}),e.jsx("p",{style:te.intervals,children:a}),e.jsx("p",{style:te.disclaimer,children:r})]})}const te={container:{padding:`${l.xl}px`,backgroundColor:t.bgPanel,borderRadius:R.lg,border:`1px solid ${t.border}`},heading:{fontSize:20,fontFamily:u.serif,fontWeight:400,color:t.text,margin:`0 0 ${l.md}px`},statement:{fontSize:14,fontFamily:u.sans,color:t.text,lineHeight:1.6,margin:`0 0 ${l.lg}px`},flaggedSection:{marginBottom:l.lg},flaggedLabel:{fontSize:12,fontFamily:u.sans,fontWeight:600,color:t.textSecondary,letterSpacing:.3},flaggedList:{listStyle:"none",padding:0,margin:`${l.sm}px 0 0`,display:"flex",flexDirection:"column",gap:l.xs},flaggedItem:{display:"flex",alignItems:"center",gap:8,fontSize:13,fontFamily:u.sans,color:t.text,lineHeight:1.5},flaggedDot:{width:6,height:6,borderRadius:"50%",backgroundColor:t.warning,flexShrink:0},intervals:{fontSize:13,fontFamily:u.sans,color:t.textSecondary,lineHeight:1.5,margin:`0 0 ${l.md}px`},disclaimer:{fontSize:12,fontFamily:u.sans,color:t.textMuted,lineHeight:1.6,margin:0}};function Et(o,s){return s?o>=.85?t.success:o>=.7?t.warning:t.danger:t.danger}function be(o){return o>=.85?t.success:o>=.7?t.warning:t.danger}function Wt({data:o}){const s=o.limitations??{flaggedForHumanReview:[],confidenceIntervals:"",disclaimer:"This analysis was produced by an AI system with multi-agent verification."};return e.jsxs("div",{children:[e.jsx("h2",{style:B.heading,children:"How This Work Was Reviewed"}),e.jsx("p",{style:B.intro,children:"A transparent record of every check, debate, and decision in this engagement."}),e.jsxs("div",{style:B.overviewCard,children:[e.jsx(fe,{value:o.agentPerformance.length,label:"agents"}),e.jsx("span",{style:B.overviewDot,children:"·"}),e.jsx(fe,{value:o.debate.findingsCount,label:"findings"}),e.jsx("span",{style:B.overviewDot,children:"·"}),e.jsx(fe,{value:o.debate.resolutionsCount,label:"debates resolved"}),e.jsx("span",{style:B.overviewDot,children:"·"}),e.jsx(fe,{value:o.gateDecisions.length,label:"gates"})]}),e.jsxs("div",{style:B.section,children:[e.jsx("div",{style:B.sectionTitle,children:"What Was Checked"}),o.verificationChecks.length>0?e.jsx("div",{style:B.checkList,children:o.verificationChecks.map((i,a)=>{const r=i.score!=null&&i.score>0,n=r?Et(i.score,i.passed):i.passed?t.success:t.danger,c=r?Math.round(i.score*100):null;return e.jsxs("div",{style:{...B.checkItem,animation:`cardStaggerUp 0.4s ease ${a*.04}s both`},onMouseEnter:m=>{m.currentTarget.style.transform="translateY(-1px)",m.currentTarget.style.boxShadow="0 2px 12px rgba(0,0,0,0.06)"},onMouseLeave:m=>{m.currentTarget.style.transform="none",m.currentTarget.style.boxShadow="none"},children:[e.jsx("span",{style:{...B.checkIcon,color:n},children:i.passed?"✓":"✗"}),e.jsx("span",{style:B.checkLabel,children:i.label}),c!==null?e.jsxs("span",{style:{...B.scorePill,backgroundColor:n===t.warning?t.warningBg:n===t.danger?"rgba(196, 93, 62, 0.1)":t.successBg,color:n},children:[c,"%"]}):e.jsx("span",{style:{...B.checkResult,color:n},children:i.passed?"Passed":"Failed"})]},a)})}):e.jsx("div",{style:B.emptyState,children:"No formal verification checks were run on this engagement."})]}),e.jsxs("div",{style:B.section,children:[e.jsx("div",{style:B.sectionTitle,children:"What Was Debated"}),o.debateResolutions.length>0?e.jsx("div",{style:B.resolutionsList,children:o.debateResolutions.map((i,a)=>e.jsxs("div",{style:{...B.resolutionCard,animation:`cardStaggerUp 0.4s ease ${a*.06}s both`},onMouseEnter:r=>{r.currentTarget.style.transform="translateY(-2px)",r.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,0.06)"},onMouseLeave:r=>{r.currentTarget.style.transform="none",r.currentTarget.style.boxShadow="none"},children:[e.jsxs("div",{style:B.resHeader,children:[e.jsx("span",{style:B.resIcon,children:"✓"}),e.jsx("span",{style:B.resLabel,children:"Resolved"}),e.jsx("span",{style:B.resTopic,children:i.topic}),i.confidence!=null&&i.confidence>0&&e.jsxs("span",{style:{...B.confidencePill,backgroundColor:be(i.confidence)===t.warning?t.warningBg:be(i.confidence)===t.danger?"rgba(196, 93, 62, 0.1)":t.successBg,color:be(i.confidence)},children:[Math.round(i.confidence*100),"%"]}),i.escalationNeeded&&e.jsx("span",{style:B.escalationBadge,children:"Escalation needed"})]}),e.jsx("div",{style:B.resBody,children:i.resolution}),i.winningPosition&&e.jsxs("div",{style:B.resDetail,children:[e.jsx("span",{style:B.resDetailLabel,children:"Position:"}),e.jsx("span",{style:B.resDetailText,children:i.winningPosition})]}),i.evidenceWeight&&e.jsxs("div",{style:B.resDetail,children:[e.jsx("span",{style:B.resDetailLabel,children:"Evidence:"}),e.jsx("span",{style:B.resDetailText,children:i.evidenceWeight})]})]},a))}):e.jsx("div",{style:B.emptyState,children:"No debates occurred — all findings were accepted without challenge."})]}),o.gateDecisions.length>0&&e.jsxs("div",{style:B.section,children:[e.jsx("div",{style:B.sectionTitle,children:"What Was Escalated"}),e.jsx("div",{style:B.gateList,children:o.gateDecisions.map((i,a)=>e.jsxs("div",{style:{...B.gateCard,animation:`cardStaggerUp 0.4s ease ${a*.06}s both`},onMouseEnter:r=>{r.currentTarget.style.transform="translateY(-2px)",r.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,0.08)"},onMouseLeave:r=>{r.currentTarget.style.transform="none",r.currentTarget.style.boxShadow="none"},children:[e.jsxs("div",{style:B.gateHeader,children:[e.jsx("span",{style:B.gateIcon,children:"⚠"}),e.jsx("span",{style:B.gateType,children:i.gateType}),e.jsx("span",{style:{...B.gateBadge,backgroundColor:i.decision==="approve"?t.successBg:t.warningBg,color:i.decision==="approve"?t.success:t.warning},children:i.decision})]}),i.summary&&e.jsx("div",{style:B.gateSummary,children:i.summary})]},a))})]}),e.jsx("div",{style:B.section,children:e.jsx(Dt,{confidence:o.verification.confidence,dimensionCount:o.verificationChecks.length,flaggedItems:s.flaggedForHumanReview,confidenceIntervals:s.confidenceIntervals,disclaimer:s.disclaimer})})]})}function fe({value:o,label:s}){return e.jsxs("span",{style:B.overviewStat,children:[e.jsx("span",{style:B.overviewValue,children:o}),e.jsx("span",{style:B.overviewLabel,children:s})]})}const B={heading:{fontSize:28,fontWeight:300,fontFamily:u.serif,color:t.text,margin:"0 0 8px",letterSpacing:-.3},intro:{fontSize:14,color:t.textMuted,lineHeight:1.6,margin:"0 0 32px"},overviewCard:{display:"flex",alignItems:"center",justifyContent:"center",gap:l.md,backgroundColor:t.bgCard,border:`1px solid ${t.border}`,borderRadius:R.lg,padding:`${l.xl}px ${l.xxl}px`,marginBottom:l.xxl},overviewStat:{display:"flex",alignItems:"baseline",gap:4},overviewValue:{fontSize:24,fontWeight:300,fontFamily:u.serif,color:t.text},overviewLabel:{fontSize:12,fontFamily:u.sans,color:t.textMuted},overviewDot:{fontSize:18,color:t.textDim},section:{marginBottom:l.xxl},sectionTitle:{fontSize:12,fontWeight:500,color:t.textMuted,textTransform:"uppercase",letterSpacing:.5,marginBottom:l.md},checkList:{display:"flex",flexDirection:"column",gap:l.xs},checkItem:{display:"flex",alignItems:"center",gap:l.md,backgroundColor:t.bgCard,border:`1px solid ${t.border}`,borderRadius:R.md,padding:`${l.md}px ${l.lg}px`,transition:"transform 0.2s ease, box-shadow 0.2s ease"},checkIcon:{fontSize:14,fontWeight:700,width:20,textAlign:"center",flexShrink:0},checkLabel:{fontSize:13,fontFamily:u.sans,color:t.text,flex:1},checkResult:{fontSize:12,fontFamily:u.sans,fontWeight:600},scorePill:{fontSize:11,fontFamily:u.sans,fontWeight:600,padding:"2px 10px",borderRadius:R.pill,letterSpacing:.2},resolutionsList:{display:"flex",flexDirection:"column",gap:l.md},resolutionCard:{backgroundColor:t.successBg,border:"1px solid rgba(74, 124, 80, 0.2)",borderRadius:R.lg,padding:l.xl,transition:"transform 0.2s ease, box-shadow 0.2s ease"},resHeader:{display:"flex",alignItems:"center",gap:6,marginBottom:l.sm},resIcon:{fontSize:12,fontWeight:700,color:t.success},resLabel:{fontSize:11,fontFamily:u.sans,fontWeight:600,color:t.success,textTransform:"uppercase",letterSpacing:.3},resTopic:{fontSize:13,fontFamily:u.sans,fontWeight:500,color:t.textSecondary,flex:1},confidencePill:{fontSize:10,fontFamily:u.sans,fontWeight:600,padding:"2px 8px",borderRadius:R.pill,letterSpacing:.2,flexShrink:0},escalationBadge:{fontSize:9,fontFamily:u.sans,fontWeight:700,color:t.danger,backgroundColor:"rgba(196, 93, 62, 0.1)",padding:"2px 8px",borderRadius:R.pill,letterSpacing:.3,textTransform:"uppercase"},resBody:{fontSize:13,fontFamily:u.sans,fontWeight:400,color:t.textSecondary,lineHeight:1.6,marginBottom:l.sm,paddingLeft:18},resDetail:{display:"flex",gap:6,paddingLeft:18,marginBottom:2},resDetailLabel:{fontSize:10,fontFamily:u.sans,fontWeight:600,color:t.textMuted,textTransform:"uppercase",letterSpacing:.3,flexShrink:0},resDetailText:{fontSize:12,fontFamily:u.sans,fontWeight:400,color:t.textSecondary,lineHeight:1.5},gateList:{display:"flex",flexDirection:"column",gap:l.sm},gateCard:{backgroundColor:t.bgCard,border:`1px solid ${t.border}`,borderRadius:R.md,padding:l.lg,transition:"transform 0.2s ease, box-shadow 0.2s ease"},gateHeader:{display:"flex",alignItems:"center",gap:l.sm,marginBottom:l.xs},gateIcon:{fontSize:14,flexShrink:0},gateType:{fontSize:13,fontFamily:u.sans,fontWeight:600,color:t.text,textTransform:"capitalize",flex:1},gateBadge:{fontSize:10,fontFamily:u.sans,fontWeight:700,padding:"2px 10px",borderRadius:R.pill,textTransform:"uppercase",letterSpacing:.3},gateSummary:{fontSize:13,fontFamily:u.sans,color:t.textSecondary,lineHeight:1.6,paddingLeft:26},emptyState:{fontSize:13,fontFamily:u.sans,color:t.textMuted,padding:`${l.lg}px ${l.xl}px`,backgroundColor:t.bgCard,border:`1px solid ${t.border}`,borderRadius:R.md,lineHeight:1.6}};function Be(o){const s=f.useRef(null),[i,a]=f.useState(!1);return f.useEffect(()=>{const r=s.current;if(!r)return;const n=new IntersectionObserver(([c])=>{c.isIntersecting&&(a(!0),n.disconnect())},{threshold:.2,...o});return n.observe(r),()=>n.disconnect()},[]),{ref:s,inView:i}}const Ie={backgroundColor:t.bgAlt,marginLeft:-64,marginRight:-64,paddingLeft:l.xxxxl,paddingRight:l.xxxxl,paddingTop:l.xxl,paddingBottom:l.xxl};function Lt({data:o}){const{ref:s,inView:i}=Be(),a=o.keyChanges.length>0,r=o.debateResolutions.length>0,n=o.dimensions.length>0,c=o.nextSteps.length>0;return!(a||r||n||c)&&o.narrative.length===0?e.jsx("div",{style:D.empty,children:e.jsx("div",{style:D.emptyText,children:"The transformation story will be available after a live session completes."})}):e.jsxs("div",{children:[e.jsx("h2",{style:D.heading,children:"The Transformation"}),e.jsx("p",{style:D.intro,children:o.executiveSummary}),n&&e.jsxs("div",{style:D.section,ref:s,children:[e.jsx("div",{style:D.dimensionGrid,children:o.dimensions.map((d,p)=>{const h=d.before/5*100,C=d.after/5*100;return e.jsxs("div",{style:D.dimensionRow,children:[e.jsx("div",{style:D.dimensionLabel,children:d.dimension}),e.jsxs("div",{style:D.barContainer,children:[e.jsx("div",{style:D.barTrack,children:e.jsx("div",{style:{...D.barBefore,width:`${h}%`,animation:i?`barGrow 0.5s ease ${p*.1}s both`:void 0}})}),e.jsx("div",{style:D.barTrack,children:e.jsx("div",{style:{...D.barAfter,width:`${C}%`,animation:i?`barGrow 0.8s ease ${p*.1+.15}s both`:void 0}})})]}),e.jsxs("div",{style:{...D.dimensionDelta,...d.delta<0?{color:t.danger}:{}},children:[d.delta>=0?"+":"",d.delta.toFixed(1)]})]},p)})}),e.jsxs("div",{style:D.barLegend,children:[e.jsxs("span",{style:D.legendItem,children:[e.jsx("span",{style:{...D.legendDot,backgroundColor:t.border}}),"Before"]}),e.jsxs("span",{style:D.legendItem,children:[e.jsx("span",{style:{...D.legendDot,backgroundColor:t.accent}}),"After"]})]})]}),a&&e.jsxs("div",{style:{...D.section,...Ie},children:[e.jsx("h3",{style:D.sectionTitle,children:"What We Found"}),e.jsxs("p",{style:D.sectionIntro,children:[o.keyChanges.length," issue",o.keyChanges.length!==1?"s":""," identified during analysis."]}),e.jsx("div",{style:D.findingsGrid,children:o.keyChanges.map((d,p)=>e.jsxs("div",{style:{...D.findingCard,animation:`cardStaggerUp 0.4s ease ${p*.06}s both`},onMouseEnter:h=>{h.currentTarget.style.transform="translateY(-2px)",h.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,0.08)"},onMouseLeave:h=>{h.currentTarget.style.transform="none",h.currentTarget.style.boxShadow="none"},children:[e.jsx("div",{style:D.findingTitle,children:d.title}),e.jsx("div",{style:D.findingBody,children:d.before})]},p))})]}),a&&e.jsxs("div",{style:D.section,children:[e.jsx("h3",{style:D.sectionTitle,children:"What Changed"}),e.jsx("div",{style:D.changesList,children:o.keyChanges.map((d,p)=>e.jsxs("div",{style:{...D.changeCard,animation:`cardStaggerUp 0.4s ease ${p*.06}s both`},onMouseEnter:h=>{h.currentTarget.style.transform="translateY(-2px)",h.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,0.08)"},onMouseLeave:h=>{h.currentTarget.style.transform="none",h.currentTarget.style.boxShadow="0 0 0 0 transparent"},children:[e.jsx("div",{style:D.changeLabel,children:d.title}),e.jsxs("div",{style:D.beforeAfterRow,children:[e.jsxs("div",{style:D.beforeCol,children:[e.jsx("div",{style:D.baTag,children:"Before"}),e.jsx("div",{style:D.beforeText,children:d.before})]}),e.jsx("div",{style:D.arrow,children:"→"}),e.jsxs("div",{style:D.afterCol,children:[e.jsx("div",{style:D.baTag,children:"After"}),e.jsx("div",{style:D.afterText,children:d.after})]})]})]},p))})]}),r&&e.jsxs("div",{style:{...D.section,...Ie},children:[e.jsx("h3",{style:D.sectionTitle,children:"What It Means"}),e.jsx("div",{style:D.resolutionList,children:o.debateResolutions.map((d,p)=>e.jsxs("div",{style:{...D.resolutionCard,animation:`cardStaggerUp 0.4s ease ${p*.06}s both`},children:[e.jsx("div",{style:D.resolutionTopic,children:d.topic}),e.jsx("div",{style:D.resolutionBody,children:d.resolution}),d.escalationNeeded&&e.jsx("div",{style:D.escalationFlag,children:"Flagged for escalation"})]},p))})]}),c&&e.jsxs("div",{style:D.section,children:[e.jsx("h3",{style:D.sectionTitle,children:"What Remains"}),e.jsx("div",{style:D.nextStepsList,children:o.nextSteps.map((d,p)=>e.jsxs("div",{style:{...D.nextStepRow,animation:`cardStaggerUp 0.4s ease ${p*.06}s both`},children:[e.jsx("div",{style:D.nextStepIcon,children:d.kind==="action"?"•":d.kind==="watchout"?"⚠":"⏰"}),e.jsxs("div",{children:[e.jsx("div",{style:D.nextStepLabel,children:d.label}),e.jsx("div",{style:D.nextStepDesc,children:d.description})]})]},p))})]})]})}const D={heading:{fontSize:28,fontWeight:300,fontFamily:u.serif,color:t.text,margin:"0 0 8px",letterSpacing:-.3},intro:{fontSize:14,color:t.textMuted,lineHeight:1.6,margin:"0 0 32px",maxWidth:660},section:{marginBottom:l.xxl},sectionTitle:{fontSize:13,fontWeight:600,fontFamily:u.sans,color:t.text,letterSpacing:.5,textTransform:"uppercase",margin:"0 0 12px"},sectionIntro:{fontSize:13,color:t.textDim,margin:"0 0 16px"},dimensionGrid:{display:"flex",flexDirection:"column",gap:10,marginBottom:8},dimensionRow:{display:"flex",alignItems:"center",gap:l.md},dimensionLabel:{fontSize:12,fontFamily:u.sans,fontWeight:500,color:t.textMuted,width:100,flexShrink:0,textAlign:"right"},barContainer:{flex:1,display:"flex",flexDirection:"column",gap:2},barTrack:{height:4,backgroundColor:t.bgPanel,borderRadius:2,overflow:"hidden"},barBefore:{height:"100%",backgroundColor:"rgba(26, 26, 26, 0.15)",borderRadius:2,transition:"width 0.6s ease"},barAfter:{height:"100%",backgroundColor:t.accent,borderRadius:2,opacity:.7,transition:"width 0.6s ease"},dimensionDelta:{fontSize:11,fontFamily:u.sans,fontWeight:600,color:t.success,width:36,flexShrink:0},barLegend:{display:"flex",gap:l.md,justifyContent:"flex-end",paddingRight:36},legendItem:{display:"flex",alignItems:"center",gap:4,fontSize:10,fontFamily:u.sans,color:t.textDim},legendDot:{display:"inline-block",width:8,height:8,borderRadius:"50%"},findingsGrid:{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))",gap:l.md},findingCard:{backgroundColor:t.bgCard,border:`1px solid ${t.border}`,borderRadius:R.md,padding:l.lg,transition:"transform 0.2s ease, box-shadow 0.2s ease"},findingTitle:{fontSize:13,fontWeight:600,fontFamily:u.sans,color:t.text,marginBottom:6},findingBody:{fontSize:13,lineHeight:1.6,color:t.textSecondary},changesList:{display:"flex",flexDirection:"column",gap:l.lg},changeCard:{backgroundColor:t.bgCard,border:`1px solid ${t.border}`,borderRadius:R.md,padding:l.xl,transition:"transform 0.2s ease, box-shadow 0.2s ease"},changeLabel:{fontSize:14,fontWeight:500,fontFamily:u.sans,color:t.text,marginBottom:l.md},beforeAfterRow:{display:"flex",flexWrap:"wrap",alignItems:"stretch",gap:l.md},beforeCol:{flex:"1 1 200px",minWidth:0},afterCol:{flex:"1 1 200px",minWidth:0},arrow:{display:"flex",alignItems:"center",fontSize:16,color:t.textDim,flexShrink:0,padding:"0 4px"},baTag:{fontSize:9,fontWeight:600,fontFamily:u.sans,letterSpacing:1,textTransform:"uppercase",color:t.textDim,marginBottom:4},beforeText:{fontSize:13,lineHeight:1.6,color:t.textMuted,textDecoration:"line-through",textDecorationColor:"rgba(26, 26, 26, 0.15)"},afterText:{fontSize:13,lineHeight:1.6,color:t.text},resolutionList:{display:"flex",flexDirection:"column",gap:l.md},resolutionCard:{borderLeft:`3px solid ${t.accent}`,paddingLeft:l.lg,paddingTop:l.xs,paddingBottom:l.xs},resolutionTopic:{fontSize:14,fontWeight:500,fontFamily:u.sans,color:t.text,marginBottom:4},resolutionBody:{fontSize:13,lineHeight:1.65,color:t.textSecondary},escalationFlag:{marginTop:6,fontSize:10,fontWeight:600,fontFamily:u.sans,color:t.warning,letterSpacing:.5,textTransform:"uppercase"},nextStepsList:{display:"flex",flexDirection:"column",gap:l.md},nextStepRow:{display:"flex",gap:l.md},nextStepIcon:{fontSize:14,color:t.textDim,flexShrink:0,width:20,textAlign:"center",paddingTop:1},nextStepLabel:{fontSize:13,fontWeight:600,fontFamily:u.sans,color:t.text,marginBottom:2},nextStepDesc:{fontSize:13,lineHeight:1.6,color:t.textSecondary},empty:{textAlign:"center",padding:"60px 0"},emptyText:{fontSize:14,color:t.textMuted}};function Bt({data:o}){const{ref:s,inView:i}=Be(),a=o.debate.challengesCount>0,r=a?Math.round(o.debate.resolutionsCount/o.debate.challengesCount*100):null;return o.cost.budget>0&&o.cost.accumulated/o.cost.budget*100,e.jsxs("div",{children:[o.confidenceSummary&&o.confidenceSummary.overall>0&&e.jsxs("div",{style:W.section,children:[e.jsx("div",{style:W.sectionTitle,children:"Engagement Confidence"}),e.jsxs("div",{style:W.card,children:[e.jsxs("div",{style:{textAlign:"center",padding:"16px 0 8px"},children:[e.jsxs("div",{style:{fontSize:"2.2rem",fontWeight:700,fontFamily:u.serif,color:o.confidenceSummary.overall>=.7?t.success:o.confidenceSummary.overall>=.5?t.warning:t.danger},children:[Math.round(o.confidenceSummary.overall*100),"%"]}),e.jsx("div",{style:{fontSize:"0.8rem",color:t.textMuted,marginTop:4},children:"weighted average across all verification layers"})]}),e.jsx("div",{style:{display:"grid",gridTemplateColumns:"repeat(3, 1fr)",gap:12,marginTop:12},children:[{label:"Findings",value:o.confidenceSummary.findings},{label:"Resolutions",value:o.confidenceSummary.resolutions},{label:"Verification",value:o.confidenceSummary.verification}].map(n=>e.jsxs("div",{style:{textAlign:"center",padding:"8px 0"},children:[e.jsxs("div",{style:{fontSize:"1.2rem",fontWeight:600,color:t.text},children:[Math.round(n.value*100),"%"]}),e.jsx("div",{style:{fontSize:"0.75rem",color:t.textMuted},children:n.label})]},n.label))}),o.confidenceSummary.grounding!=null&&e.jsxs("div",{style:{textAlign:"center",padding:"8px 0",borderTop:`1px solid ${t.border}`,marginTop:8},children:[e.jsxs("div",{style:{fontSize:"1rem",fontWeight:600,color:t.text},children:[Math.round(o.confidenceSummary.grounding*100),"% evidence grounded"]}),e.jsx("div",{style:{fontSize:"0.75rem",color:t.textMuted},children:"citations verified against source document"})]}),o.confidenceSummary.lowConfidenceCount>0&&e.jsxs("div",{style:{background:t.warningBg,border:`1px solid ${t.warning}`,borderRadius:R.sm,padding:"8px 12px",marginTop:8,fontSize:"0.82rem",color:t.warning},children:[o.confidenceSummary.lowConfidenceCount," finding",o.confidenceSummary.lowConfidenceCount>1?"s":""," with confidence below 70%"]})]})]}),o.dimensions.length>0&&e.jsxs("div",{style:W.section,ref:s,children:[e.jsx("div",{style:W.sectionTitle,children:"Quality Improvement"}),e.jsxs("div",{style:W.card,children:[o.dimensions.map((n,c)=>e.jsxs("div",{style:W.dimRow,children:[e.jsx("div",{style:W.dimLabel,children:n.dimension}),e.jsx("div",{style:W.dimBarWrap,children:e.jsxs("div",{style:W.dimBarStack,children:[e.jsx("div",{style:W.dimBarTrack,children:e.jsx("div",{style:{...W.dimBarBefore,width:`${n.before/5*100}%`,animation:i?`barGrow 0.5s ease ${c*.1}s both`:void 0}})}),e.jsx("div",{style:W.dimBarTrack,children:e.jsx("div",{style:{...W.dimBarAfter,width:`${n.after/5*100}%`,animation:i?`barGrow 0.8s ease ${c*.1+.15}s both`:void 0}})})]})}),e.jsxs("div",{style:{...W.dimDelta,...n.delta<0?{color:t.danger}:{}},children:[n.delta>=0?"+":"",n.delta.toFixed(1)]})]},c)),e.jsxs("div",{style:W.dimFooter,children:["Overall improvement: ",e.jsxs("strong",{children:["+",(o.dimensions.reduce((n,c)=>n+c.delta,0)/o.dimensions.length).toFixed(1)]})," average across ",o.dimensions.length," dimensions"]})]})]}),e.jsxs("div",{style:W.statsGrid,children:[e.jsx(ve,{label:"Status",value:o.status}),e.jsx(ve,{label:"Events",value:String(o.eventCount)}),e.jsx(ve,{label:"Verification",value:`${o.verification.passed}/${o.verification.resultsCount}`,detail:o.verification.failed===0?"all passed":`${o.verification.failed} failed`,color:o.verification.failed===0?t.success:t.danger})]}),e.jsxs("div",{style:W.section,children:[e.jsx("div",{style:W.sectionTitle,children:"Deliberation Flow"}),e.jsxs("div",{style:W.card,children:[e.jsxs("div",{style:W.flowRow,children:[e.jsx(xe,{label:"Findings",count:o.debate.findingsCount,color:t.text}),e.jsx("div",{style:W.flowArrow,children:"→"}),e.jsx(xe,{label:"Challenges",count:o.debate.challengesCount,color:t.warning}),e.jsx("div",{style:W.flowArrow,children:"→"}),e.jsx(xe,{label:"Resolutions",count:o.debate.resolutionsCount,color:t.success})]}),a?e.jsxs("div",{style:W.rateRow,children:[e.jsx("span",{style:W.rateLabel,children:"Resolution rate"}),e.jsx("div",{style:W.rateBarTrack,children:e.jsx("div",{style:{...W.rateBarFill,width:`${r}%`,backgroundColor:o.debate.unresolvedCount===0?t.success:t.warning}})}),e.jsxs("span",{style:W.rateValue,children:[r,"%"]})]}):e.jsx("div",{style:W.noDebateNote,children:"No challenges were raised — findings accepted by consensus"}),o.debate.unresolvedCount>0&&e.jsxs("div",{style:W.unresolvedNote,children:[o.debate.unresolvedCount," unresolved ",o.debate.unresolvedCount===1?"finding":"findings"," — flagged for human review"]})]})]}),o.agentPerformance.length>0&&e.jsxs("div",{style:W.section,children:[e.jsx("div",{style:W.sectionTitle,children:"Team Performance"}),e.jsxs("div",{style:W.card,children:[e.jsxs("div",{style:W.perfHeader,children:[e.jsx("span",{style:W.perfHeaderCell,children:"Agent"}),e.jsx("span",{style:W.perfHeaderCellRight,children:"Findings"}),e.jsx("span",{style:W.perfHeaderCellRight,children:"Confidence"})]}),o.agentPerformance.map((n,c)=>e.jsxs("div",{style:W.perfRow,children:[e.jsx("span",{style:W.perfName,children:n.name}),e.jsx("span",{style:W.perfStat,children:n.findingsPosted}),e.jsx("span",{style:W.perfStat,children:n.avgConfidence>0?`${(n.avgConfidence*100).toFixed(0)}%`:"—"})]},c))]})]})]})}function ve({label:o,value:s,detail:i,color:a}){return e.jsxs("div",{style:W.statCard,onMouseEnter:r=>{r.currentTarget.style.transform="translateY(-2px)",r.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,0.08)"},onMouseLeave:r=>{r.currentTarget.style.transform="none",r.currentTarget.style.boxShadow="none"},children:[e.jsx("div",{style:W.statLabel,children:o}),e.jsx("div",{style:{...W.statValue,...a?{color:a}:{}},children:s}),i&&e.jsx("div",{style:W.statDetail,children:i})]})}function xe({label:o,count:s,color:i}){return e.jsxs("div",{style:W.flowStep,children:[e.jsx("div",{style:{...W.flowCount,color:i},children:s}),e.jsx("div",{style:W.flowLabel,children:o})]})}const W={section:{marginBottom:l.xl},sectionTitle:{fontSize:12,fontWeight:500,color:t.textMuted,textTransform:"uppercase",letterSpacing:.5,marginBottom:l.md},card:{backgroundColor:t.bgCard,border:`1px solid ${t.border}`,borderRadius:R.lg,padding:l.xl},statsGrid:{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(140px, 1fr))",gap:l.md,marginBottom:l.xl},statCard:{backgroundColor:t.bgCard,border:`1px solid ${t.border}`,borderRadius:R.md,padding:l.lg,textAlign:"center",transition:"transform 0.2s ease, box-shadow 0.2s ease"},statLabel:{fontSize:10,fontWeight:600,color:t.textDim,letterSpacing:1,textTransform:"uppercase",marginBottom:4},statValue:{fontSize:22,fontWeight:300,fontFamily:u.serif,color:t.text,textTransform:"capitalize"},statDetail:{fontSize:11,color:t.textDim,marginTop:2},dimRow:{display:"flex",alignItems:"center",gap:l.md,padding:"6px 0",borderBottom:`1px solid ${t.bgPanel}`},dimLabel:{width:100,fontSize:13,fontWeight:500,color:t.text,flexShrink:0},dimBarWrap:{flex:1},dimBarStack:{display:"flex",flexDirection:"column",gap:2},dimBarTrack:{height:7,backgroundColor:t.bgPanel,borderRadius:3,overflow:"hidden"},dimBarBefore:{height:"100%",backgroundColor:"rgba(26, 26, 26, 0.15)",borderRadius:3},dimBarAfter:{height:"100%",backgroundColor:t.accent,borderRadius:3,opacity:.7},dimDelta:{width:40,textAlign:"right",fontSize:13,fontWeight:600,fontFamily:u.mono,color:t.success,flexShrink:0},dimFooter:{fontSize:12,color:t.textMuted,marginTop:l.md,paddingTop:l.sm},flowRow:{display:"flex",alignItems:"center",justifyContent:"center",gap:l.lg,marginBottom:l.lg},flowStep:{textAlign:"center"},flowCount:{fontSize:28,fontWeight:300,fontFamily:u.serif,marginBottom:2},flowLabel:{fontSize:11,fontWeight:500,color:t.textDim,textTransform:"uppercase",letterSpacing:.5},flowArrow:{color:t.textDim,fontSize:16},rateRow:{display:"flex",alignItems:"center",gap:l.sm},rateLabel:{fontSize:12,color:t.textMuted,width:100,flexShrink:0},rateBarTrack:{flex:1,height:6,backgroundColor:t.bgPanel,borderRadius:3,overflow:"hidden",marginTop:4},rateBarFill:{height:"100%",borderRadius:3,transition:"width 0.5s ease"},rateValue:{fontSize:13,fontWeight:600,fontFamily:u.mono,color:t.text,width:40,textAlign:"right"},unresolvedNote:{fontSize:12,color:t.warning,marginTop:l.sm,fontWeight:500},noDebateNote:{fontSize:12,color:t.textMuted},perfHeader:{display:"flex",alignItems:"center",padding:"0 0 8px",borderBottom:`1px solid ${t.border}`,marginBottom:l.xs},perfHeaderCell:{flex:1,fontSize:10,fontWeight:600,color:t.textDim,letterSpacing:.5,textTransform:"uppercase"},perfHeaderCellRight:{width:80,textAlign:"right",fontSize:10,fontWeight:600,color:t.textDim,letterSpacing:.5,textTransform:"uppercase"},perfRow:{display:"flex",alignItems:"center",padding:"6px 0",borderBottom:`1px solid ${t.bgPanel}`},perfName:{flex:1,fontSize:13,color:t.text},perfStat:{width:80,textAlign:"right",fontSize:13,fontFamily:u.mono,color:t.textSecondary}};function Ft({data:o}){const s=o.nextSteps.filter(r=>r.kind==="action"),i=o.nextSteps.filter(r=>r.kind==="watchout"),a=o.nextSteps.filter(r=>r.kind==="schedule");return o.nextSteps.length===0?e.jsx("div",{style:M.empty,children:e.jsx("div",{style:M.emptyText,children:"Implementation guidance will be available after a live session completes."})}):e.jsxs("div",{children:[e.jsx("h2",{style:M.heading,children:"Implementation Guide"}),e.jsx("p",{style:M.intro,children:"Practical steps for putting the delivered work into use."}),s.length>0&&e.jsxs("div",{style:M.section,children:[e.jsx("div",{style:M.sectionTitle,children:"Action Items"}),e.jsx("div",{style:M.list,children:s.map((r,n)=>e.jsx("div",{style:{...M.item,animation:`cardStaggerUp 0.4s ease ${n*.06}s both`},onMouseEnter:c=>{c.currentTarget.style.transform="translateY(-2px)",c.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,0.08)"},onMouseLeave:c=>{c.currentTarget.style.transform="none",c.currentTarget.style.boxShadow="none"},children:e.jsxs("div",{style:M.checkboxRow,children:[e.jsx("div",{style:M.checkbox,children:e.jsx("span",{style:M.checkNumber,children:n+1})}),e.jsxs("div",{style:M.itemContent,children:[e.jsx("div",{style:M.itemLabel,children:r.label}),e.jsx("div",{style:M.itemDesc,children:r.description})]})]})},n))})]}),i.length>0&&e.jsxs("div",{style:M.section,children:[e.jsx("div",{style:M.sectionTitle,children:"Watch-Outs"}),e.jsx("div",{style:M.watchoutList,children:i.map((r,n)=>e.jsxs("div",{style:{...M.watchoutCard,animation:`cardStaggerUp 0.4s ease ${n*.06}s both`},onMouseEnter:c=>{c.currentTarget.style.transform="translateY(-2px)",c.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,0.06)"},onMouseLeave:c=>{c.currentTarget.style.transform="none",c.currentTarget.style.boxShadow="none"},children:[e.jsx("div",{style:M.watchoutIcon,children:"⚠"}),e.jsxs("div",{style:M.itemContent,children:[e.jsx("div",{style:M.itemLabel,children:r.label}),e.jsx("div",{style:M.itemDesc,children:r.description})]})]},n))})]}),a.length>0&&e.jsxs("div",{style:M.section,children:[e.jsx("div",{style:M.sectionTitle,children:"Review Schedule"}),e.jsx("div",{style:M.list,children:a.map((r,n)=>e.jsxs("div",{style:{...M.scheduleCard,animation:`cardStaggerUp 0.4s ease ${n*.06}s both`},onMouseEnter:c=>{c.currentTarget.style.transform="translateY(-2px)",c.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,0.08)"},onMouseLeave:c=>{c.currentTarget.style.transform="none",c.currentTarget.style.boxShadow="none"},children:[e.jsx("div",{style:M.scheduleIcon,children:"○"}),e.jsxs("div",{style:M.itemContent,children:[e.jsx("div",{style:M.itemLabel,children:r.label}),e.jsx("div",{style:M.itemDesc,children:r.description})]})]},n))})]})]})}const M={heading:{fontSize:28,fontWeight:300,fontFamily:u.serif,color:t.text,margin:"0 0 8px",letterSpacing:-.3},intro:{fontSize:14,color:t.textMuted,lineHeight:1.6,margin:"0 0 32px"},section:{marginBottom:l.xxl},sectionTitle:{fontSize:12,fontWeight:500,color:t.textMuted,textTransform:"uppercase",letterSpacing:.5,marginBottom:l.md},list:{display:"flex",flexDirection:"column",gap:l.sm},item:{backgroundColor:t.bgCard,border:`1px solid ${t.border}`,borderRadius:R.md,padding:l.lg,transition:"transform 0.2s ease, box-shadow 0.2s ease"},checkboxRow:{display:"flex",gap:l.md,alignItems:"flex-start"},checkbox:{width:28,height:28,borderRadius:"50%",border:`2px solid ${t.border}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:2},checkNumber:{fontSize:12,fontWeight:600,color:t.textDim,fontFamily:u.mono},itemContent:{flex:1},itemLabel:{fontSize:14,fontWeight:600,color:t.text,marginBottom:4},itemDesc:{fontSize:13,color:t.textSecondary,lineHeight:1.6},watchoutList:{display:"flex",flexDirection:"column",gap:l.sm},watchoutCard:{display:"flex",gap:l.md,alignItems:"flex-start",backgroundColor:t.warningBg,border:"1px solid rgba(184, 134, 11, 0.15)",borderRadius:R.md,padding:l.lg,transition:"transform 0.2s ease, box-shadow 0.2s ease"},watchoutIcon:{fontSize:16,flexShrink:0,marginTop:2},scheduleCard:{display:"flex",gap:l.md,alignItems:"flex-start",backgroundColor:t.bgCard,border:`1px solid ${t.border}`,borderRadius:R.md,padding:l.lg,transition:"transform 0.2s ease, box-shadow 0.2s ease"},scheduleIcon:{fontSize:16,flexShrink:0,marginTop:2},empty:{textAlign:"center",padding:"60px 0"},emptyText:{fontSize:14,color:t.textMuted}};function we(o,s){const i=[],a=/(\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`)/g;let r=0,n,c=0;for(;(n=a.exec(o))!==null;){n.index>r&&i.push(o.slice(r,n.index));const m=`${s}-${c++}`;n[2]!==void 0?i.push(e.jsx("strong",{children:n[2]},m)):n[3]!==void 0?i.push(e.jsx("span",{children:n[3]},m)):n[4]!==void 0&&i.push(e.jsx("code",{style:{fontFamily:"ui-monospace, monospace",fontSize:"0.92em",backgroundColor:"rgba(0,0,0,0.05)",padding:"1px 4px",borderRadius:3},children:n[4]},m)),r=n.index+n[0].length}return r<o.length&&i.push(o.slice(r)),i}function $t(o){const s=o.split(`
`),i=[];let a=0,r=[],n=[];const c=()=>{if(r.length){const d=r.join(" ");i.push(e.jsx("p",{style:{margin:"0 0 8px 0"},children:we(d,`p-${i.length}`)},`p-${i.length}`)),r=[]}},m=()=>{if(n.length){const d=n;i.push(e.jsx("ul",{style:{margin:"0 0 8px 0",paddingLeft:20},children:d.map((p,h)=>e.jsx("li",{style:{marginBottom:2},children:we(p,`li-${i.length}-${h}`)},h))},`ul-${i.length}`)),n=[]}};for(;a<s.length;){const p=s[a].trim();if(p===""){c(),m(),a++;continue}const h=p.match(/^(#{1,6})\s+(.*)$/);if(h){c(),m();const I=h[1].length,g=h[2],T=I<=2?15:I===3?14:13;i.push(e.jsx("div",{style:{fontWeight:600,fontSize:T,margin:"10px 0 6px 0",lineHeight:1.35},children:we(g,`h-${i.length}`)},`h-${i.length}`)),a++;continue}const C=p.match(/^[-*]\s+(.*)$/);if(C){c(),n.push(C[1]),a++;continue}const w=p.match(/^\d+\.\s+(.*)$/);if(w){c(),n.push(w[1]),a++;continue}m(),r.push(p),a++}return c(),m(),e.jsx(e.Fragment,{children:i})}function Ht({sessionId:o,messages:s,setMessages:i,input:a,setInput:r,streaming:n,setStreaming:c}){const m=f.useRef(null),d=f.useRef(null),p=f.useRef(null),h=f.useRef(s);h.current=s;const{isSupported:C,isListening:w,finalTranscript:I,startListening:g,stopListening:T,clearTranscript:j}=Me(),[P,L]=f.useState(!1),y=f.useRef(null);f.useEffect(()=>{var v;(v=m.current)==null||v.scrollIntoView({behavior:"smooth"})},[s]),f.useEffect(()=>()=>{var v;(v=p.current)==null||v.abort()},[]);const k=f.useCallback(async v=>{var K;const S=(v??a).trim();if(!S||n)return;const F={role:"user",content:S},E=[...h.current];i(Y=>[...Y,F]),v||r(""),c(!0),i(Y=>[...Y,{role:"assistant",content:""}]);const $=new AbortController;p.current=$;try{const Y=await fetch(`/api/sessions/${o}/conversation`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({message:S,history:E}),signal:$.signal});if(!Y.ok){const oe=await Y.json().catch(()=>({error:"Request failed"}));i(V=>{const ie=[...V];return ie.length>0&&(ie[ie.length-1]={role:"assistant",content:`Error: ${oe.error||"Something went wrong."}`}),ie}),r(S),c(!1);return}const X=await Y.json().catch(()=>null),Z=(X==null?void 0:X.content)??"";i(Z?oe=>{const V=[...oe];return V.length===0||(V[V.length-1]={role:"assistant",content:Z}),V}:oe=>{const V=[...oe];return V.length>0&&(V[V.length-1]={role:"assistant",content:X!=null&&X.error?`Error: ${X.error}`:"No response received from the server."}),V})}catch(Y){if($.signal.aborted)return;i(X=>{const Z=[...X];return Z.length>0&&(Z[Z.length-1]={role:"assistant",content:`Connection error: ${Y instanceof Error?Y.message:"Unable to reach the server."}`}),Z}),r(S)}finally{$.signal.aborted||(c(!1),(K=d.current)==null||K.focus()),p.current=null}},[a,n,o,i,r,c]),b=f.useCallback(v=>{v.key==="Enter"&&!v.shiftKey&&(v.preventDefault(),k())},[k]);f.useEffect(()=>{y.current=v=>{k(v)}},[k]),f.useEffect(()=>{var S;if(!I||!P)return;const v=I.trim();v&&(r(""),L(!1),T(),j(),(S=y.current)==null||S.call(y,v))},[I,P,T,j]);const A=f.useCallback(()=>{P?(L(!1),T(),j()):(L(!0),j(),g())},[P,g,T,j]);return e.jsxs("div",{style:G.container,children:[e.jsxs("div",{style:G.header,children:[e.jsx("div",{style:G.headerDot}),e.jsxs("div",{children:[e.jsx("div",{style:G.headerTitle,children:"Ask the Team"}),e.jsx("div",{style:G.headerSub,children:"Questions about findings, alternative clauses, follow-up analyses"})]})]}),e.jsxs("div",{style:G.messageArea,"aria-live":"polite","aria-label":"Conversation messages",children:[s.length===0&&e.jsxs("div",{style:G.emptyState,children:[e.jsx("div",{style:G.emptyTitle,children:"What would you like to know?"}),e.jsx("div",{style:G.emptyHints,children:[{text:"Summarize the key risks",prompt:"Summarize the key risks in plain language"},{text:"Draft an alternative clause",prompt:"Draft an alternative clause for the most critical finding"},{text:"What to fix first?",prompt:"What should we prioritize fixing first?"}].map(({text:v,prompt:S})=>e.jsx("button",{style:{...G.hint,...n?{opacity:.4,cursor:"not-allowed"}:{}},disabled:n,onClick:()=>{var F;r(S),(F=d.current)==null||F.focus()},onMouseEnter:F=>{n||(F.currentTarget.style.borderColor=t.textMuted,F.currentTarget.style.color=t.text)},onMouseLeave:F=>{F.currentTarget.style.borderColor=t.border,F.currentTarget.style.color=t.textSecondary},children:v},v))})]}),s.map((v,S)=>e.jsx("div",{style:v.role==="user"?G.userRow:G.assistantRow,children:e.jsx("div",{style:v.role==="user"?G.userBubble:G.assistantBubble,children:v.role==="assistant"&&v.content===""&&n?e.jsxs("span",{style:G.thinking,children:["Thinking",e.jsx("span",{style:G.thinkingDots,children:"..."})]}):v.role==="assistant"?e.jsx("div",{style:G.messageText,children:$t(v.content)}):e.jsx("div",{style:G.messageText,children:v.content})})},`${v.role}-${S}-${v.content.length}`)),e.jsx("div",{ref:m})]}),e.jsxs("div",{style:G.inputRow,children:[e.jsx("input",{ref:d,type:"text","aria-label":"Ask a question about the analysis",placeholder:P&&w?"Listening…":"Ask a question about the analysis…",value:a,onChange:v=>r(v.target.value),onKeyDown:b,style:{...G.input,borderColor:w?"rgba(180,60,40,0.4)":void 0},disabled:n,autoFocus:!0,onFocus:v=>{v.currentTarget.style.borderColor=t.accent},onBlur:v=>{v.currentTarget.style.borderColor=t.border}}),C&&e.jsx("button",{onClick:A,disabled:n,title:P?"Stop listening":"Ask by voice",style:{...G.micBtn,backgroundColor:P?w?"rgba(180,60,40,0.1)":"rgba(26,26,26,0.04)":"transparent",borderColor:P?"rgba(180,60,40,0.35)":t.border,opacity:n?.3:1},children:e.jsxs("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:w?"#b43c28":t.textMuted,strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("rect",{x:"9",y:"2",width:"6",height:"12",rx:"3"}),e.jsx("path",{d:"M19 10a7 7 0 0 1-14 0"}),e.jsx("line",{x1:"12",y1:"19",x2:"12",y2:"22"}),e.jsx("line",{x1:"8",y1:"22",x2:"16",y2:"22"})]})}),e.jsx("button",{onClick:()=>void k(),disabled:n||a.trim().length===0,style:{...G.sendBtn,opacity:n||a.trim().length===0?.4:1,cursor:n||a.trim().length===0?"not-allowed":"pointer"},children:"Send"})]})]})}const G={container:{display:"flex",flexDirection:"column",height:"calc(100vh - 260px)",minHeight:360,maxHeight:"calc(100vh - 180px)"},header:{display:"flex",alignItems:"center",gap:l.md,paddingBottom:l.lg,borderBottom:`1px solid ${t.border}`,marginBottom:l.lg},headerDot:{width:10,height:10,borderRadius:"50%",backgroundColor:t.accent,flexShrink:0},headerTitle:{fontFamily:u.serif,fontSize:18,fontWeight:400,color:t.text,letterSpacing:-.3},headerSub:{fontSize:12,color:t.textMuted,marginTop:2},messageArea:{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",gap:l.lg,paddingBottom:l.lg},emptyState:{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flex:1,gap:l.xl,paddingTop:l.xxxl},emptyTitle:{fontFamily:u.serif,fontSize:20,fontWeight:300,color:t.textMuted,letterSpacing:-.3},emptyHints:{display:"flex",flexWrap:"wrap",gap:l.sm,justifyContent:"center",maxWidth:500},hint:{padding:"8px 16px",borderRadius:R.pill,border:`1px solid ${t.border}`,backgroundColor:"transparent",color:t.textSecondary,fontFamily:u.sans,fontSize:12,cursor:"pointer",transition:"border-color 0.15s ease, color 0.15s ease"},userRow:{display:"flex",justifyContent:"flex-end"},assistantRow:{display:"flex",justifyContent:"flex-start"},userBubble:{maxWidth:"75%",padding:"10px 16px",borderRadius:`${R.md}px ${R.md}px 2px ${R.md}px`,backgroundColor:t.text,color:"#fff"},assistantBubble:{maxWidth:"85%",padding:"10px 16px",borderRadius:`${R.md}px ${R.md}px ${R.md}px 2px`,backgroundColor:t.bgPanel,color:t.text,border:`1px solid ${t.border}`},messageText:{fontFamily:u.sans,fontSize:13,lineHeight:1.6,whiteSpace:"pre-wrap",wordBreak:"break-word"},thinking:{fontFamily:u.sans,fontSize:13,color:t.textMuted},thinkingDots:{animation:"thinkingPulse 1.4s ease-in-out infinite"},inputRow:{display:"flex",gap:l.sm,paddingTop:l.lg,borderTop:`1px solid ${t.border}`},input:{flex:1,padding:"12px 16px",fontSize:13,fontFamily:u.sans,color:t.text,backgroundColor:t.bgInput,border:`1.5px solid ${t.border}`,borderRadius:R.sm,boxSizing:"border-box",transition:"border-color 0.2s ease"},sendBtn:{padding:"12px 24px",fontSize:12,fontWeight:600,fontFamily:u.sans,letterSpacing:1,textTransform:"uppercase",color:"#fff",backgroundColor:t.text,border:`2px solid ${t.text}`,borderRadius:R.sm,cursor:"pointer",transition:"opacity 0.2s ease",flexShrink:0},micBtn:{width:42,height:42,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:"50%",border:`1.5px solid ${t.border}`,backgroundColor:"transparent",cursor:"pointer",transition:"background-color 0.2s ease, border-color 0.2s ease"}},De=["rgba(196, 93, 62, 0.8)","rgba(184, 134, 11, 0.7)","rgba(196, 93, 62, 0.5)","rgba(184, 134, 11, 0.4)","rgba(74, 124, 80, 0.5)"];function Mt(o){return Array.from({length:o},(s,i)=>({id:i,x:20+Math.random()*60,size:2+Math.random()*4,color:De[Math.floor(Math.random()*De.length)],delay:Math.random()*.6,rotate:-60+Math.random()*120,duration:1.2+Math.random()*.8}))}function zt(){const[o]=f.useState(()=>Mt(24)),[s,i]=f.useState(!0);return f.useEffect(()=>{const a=setTimeout(()=>i(!1),2800);return()=>clearTimeout(a)},[]),s?e.jsx("div",{style:Nt.container,children:o.map(a=>e.jsx("div",{style:{position:"absolute",left:`${a.x}%`,bottom:0,width:a.size,height:a.size,borderRadius:a.size>4?1:"50%",backgroundColor:a.color,animation:`confettiRise ${a.duration}s ease-out ${a.delay}s both`,"--confetti-rotate":`${a.rotate}deg`,pointerEvents:"none"}},a.id))}):null}const Nt={container:{position:"relative",width:"100%",height:0,overflow:"visible",pointerEvents:"none"}};function Ut(){return e.jsxs("div",{style:q.container,children:[e.jsxs("div",{style:q.headerArea,children:[e.jsx("div",{style:{...q.bone,width:180,height:14}}),e.jsx("div",{style:{...q.bone,width:260,height:24,marginTop:12}}),e.jsx("div",{style:{...q.bone,width:120,height:10,marginTop:8}})]}),e.jsx("div",{style:q.tabBar,children:[80,70,65,90,75,85].map((o,s)=>e.jsx("div",{style:{...q.bone,width:o,height:28,borderRadius:14}},s))}),e.jsxs("div",{style:q.contentArea,children:[e.jsx("div",{style:{...q.bone,width:"60%",height:18,marginBottom:16}}),e.jsx("div",{style:{...q.bone,width:"100%",height:12,marginBottom:10}}),e.jsx("div",{style:{...q.bone,width:"90%",height:12,marginBottom:10}}),e.jsx("div",{style:{...q.bone,width:"75%",height:12,marginBottom:10}}),e.jsx("div",{style:{...q.bone,width:"85%",height:12,marginBottom:24}}),e.jsx("div",{style:{...q.bone,width:"45%",height:16,marginBottom:14}}),e.jsx("div",{style:{...q.bone,width:"100%",height:12,marginBottom:10}}),e.jsx("div",{style:{...q.bone,width:"95%",height:12,marginBottom:10}}),e.jsx("div",{style:{...q.bone,width:"70%",height:12,marginBottom:10}})]}),e.jsxs("div",{style:q.statusArea,children:[e.jsx("div",{style:q.breathingM,children:"M"}),e.jsx("div",{style:q.statusText,children:"Preparing your delivery"})]})]})}const q={container:{padding:`${l.xl}px 0`},headerArea:{marginBottom:l.xl},tabBar:{display:"flex",gap:8,marginBottom:l.xxl,flexWrap:"wrap"},contentArea:{padding:`${l.lg}px 0`},bone:{backgroundColor:t.border,borderRadius:R.sm,animation:"skeletonPulse 1.8s ease-in-out infinite"},statusArea:{display:"flex",flexDirection:"column",alignItems:"center",paddingTop:l.xl},breathingM:{fontFamily:u.serif,fontSize:28,fontWeight:300,color:t.text,lineHeight:1,animation:"lavernLoadBreath 2.4s ease-in-out infinite"},statusText:{fontFamily:u.sans,fontSize:11,fontWeight:500,color:t.textDim,letterSpacing:.5,textTransform:"uppercase",marginTop:10}};function Kt({onContinue:o,onBack:s,onSkip:i}){const{data:a,loading:r,error:n,assemblyStatus:c,retryAssembly:m}=Ke(),[d,p]=f.useState("work"),{isMobile:h}=We(),[C,w]=f.useState([]),[I,g]=f.useState(""),[T,j]=f.useState(!1),P=(a==null?void 0:a.sessionId.startsWith("demo-session"))??!1,[L]=f.useState(()=>sessionStorage.getItem("shem-from-archive")==="true"?(sessionStorage.removeItem("shem-from-archive"),!0):!1),[y]=f.useState(()=>{try{const k=sessionStorage.getItem("shem-matter-data");return k?JSON.parse(k):{}}catch{return{}}});return e.jsxs("main",{style:{...Q.container,...h?{padding:l.lg}:{}},id:"main-content",children:[e.jsx(at,{matterNumber:y.matterNumber,matterType:y.matterType,jurisdiction:y.jurisdiction,onBack:L?()=>{window.location.hash="#/my-cases"}:s,onSkip:L?void 0:i}),r&&e.jsx(Ut,{}),n&&e.jsx("div",{style:Q.errorState,children:n}),a&&e.jsxs(e.Fragment,{children:[e.jsx(zt,{}),e.jsx(lt,{activeTab:d,onTabChange:p}),e.jsxs("div",{role:"tabpanel",id:`panel-${d}`,"aria-labelledby":`tab-${d}`,style:{animation:"tabFadeIn 0.3s ease both"},children:[d==="work"&&e.jsx(It,{data:a,assemblyStatus:c,onRetryAssembly:m}),d==="review"&&e.jsx(Wt,{data:a}),d==="story"&&e.jsx(Lt,{data:a}),d==="scorecard"&&e.jsx(Bt,{data:a}),d==="next-steps"&&e.jsx(Ft,{data:a}),d==="conversation"&&(P?e.jsxs("div",{style:Q.demoConversationNotice,children:[e.jsx("div",{style:Q.demoNoticeTitle,children:"Live Session Feature"}),e.jsx("div",{style:Q.demoNoticeBody,children:"In a live engagement, you can ask the team follow-up questions about their analysis, request alternative clause drafts, or drill into specific findings. The team responds with full context from the session."})]}):e.jsx(Ht,{sessionId:a.sessionId,messages:C,setMessages:w,input:I,setInput:g,streaming:T,setStreaming:j}))]},d)]}),e.jsx("div",{style:Q.footer,children:L?e.jsxs(e.Fragment,{children:[e.jsx("button",{onClick:()=>{window.location.hash="#/working"},style:Q.secondaryBtn,onMouseEnter:k=>{const b=k.currentTarget;b.style.backgroundColor=t.text,b.style.color="#fff",b.style.transform="translateY(-2px)",b.style.boxShadow="0 4px 16px rgba(0,0,0,0.2)"},onMouseLeave:k=>{const b=k.currentTarget;b.style.backgroundColor="transparent",b.style.color=t.text,b.style.transform="",b.style.boxShadow="inset 0 1px 0 rgba(255,255,255,0.5)"},children:"View Agent Work"}),e.jsxs("button",{onClick:()=>{window.location.hash="#/my-cases"},style:Q.continueBtn,onMouseEnter:k=>{const b=k.currentTarget;b.style.transform="translateY(-2px) scale(1.02)",b.style.boxShadow="inset 0 1px 0 rgba(255,255,255,0.12), 0 4px 16px rgba(0,0,0,0.4), 0 14px 40px rgba(0,0,0,0.25)"},onMouseLeave:k=>{const b=k.currentTarget;b.style.transform="",b.style.boxShadow="inset 0 1px 0 rgba(255,255,255,0.12), 0 2px 8px rgba(0,0,0,0.35), 0 8px 28px rgba(0,0,0,0.18)"},children:["←"," Back to Cases"]})]}):e.jsxs("button",{onClick:o,style:Q.continueBtn,onMouseEnter:k=>{const b=k.currentTarget;b.style.backgroundColor="transparent",b.style.color=t.text},onMouseLeave:k=>{const b=k.currentTarget;b.style.backgroundColor=t.text,b.style.color="#fff"},children:["Continue to Billing ","→"]})}),e.jsx("p",{style:Q.aiDisclaimer,children:"Lavern assists with document design and analysis. It does not provide legal advice. Always verify results with qualified legal professionals."}),e.jsx("div",{style:Q.brandingFooter,children:e.jsx(Ee,{color:t.textDim,glow:"rgba(150, 135, 95, 0.4)",style:{fontSize:9,letterSpacing:4}})})]})}const Q={container:{width:"100%",minHeight:"100vh",backgroundColor:t.bg,color:t.text,fontFamily:u.sans,padding:`${l.xxxxl}px`,maxWidth:940,margin:"0 auto",position:"relative"},errorState:{textAlign:"center",color:t.danger,fontSize:14,padding:"60px 0"},footer:{display:"flex",justifyContent:"center",gap:l.md,paddingTop:l.xxxl,paddingBottom:l.xxxxl},brandingFooter:{textAlign:"center",paddingTop:l.xxl,paddingBottom:l.xl},secondaryBtn:{padding:"15px 40px",borderRadius:100,border:`1.5px solid ${t.text}`,backgroundColor:"transparent",color:t.text,fontFamily:u.sans,fontSize:11,fontWeight:600,letterSpacing:2,textTransform:"uppercase",cursor:"pointer",transition:"background-color 0.22s ease, color 0.22s ease, transform 0.22s ease, box-shadow 0.22s ease",boxShadow:"inset 0 1px 0 rgba(255,255,255,0.5)"},continueBtn:{padding:"15px 40px",borderRadius:100,border:"none",background:`linear-gradient(170deg, ${t.text} 0%, #0d0d0d 100%)`,color:"#fff",fontFamily:u.sans,fontSize:11,fontWeight:600,letterSpacing:2,textTransform:"uppercase",cursor:"pointer",transition:"transform 0.22s ease, box-shadow 0.22s ease",boxShadow:"inset 0 1px 0 rgba(255,255,255,0.12), 0 2px 8px rgba(0,0,0,0.35), 0 8px 28px rgba(0,0,0,0.18)"},demoConversationNotice:{textAlign:"center",padding:"60px 40px",backgroundColor:t.bgCard,border:`1px solid ${t.border}`,borderRadius:R.sm},demoNoticeTitle:{fontSize:14,fontWeight:600,fontFamily:u.sans,color:t.text,marginBottom:12},demoNoticeBody:{fontSize:13,fontFamily:u.sans,color:t.textMuted,lineHeight:1.7,maxWidth:480,margin:"0 auto"},aiDisclaimer:{textAlign:"center",fontSize:11,fontFamily:u.serif,color:t.textDim,lineHeight:1.6,maxWidth:480,margin:"0 auto",paddingTop:l.lg}};export{Kt as default};
