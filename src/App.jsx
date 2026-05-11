import { useState, useEffect, useRef } from "react";

// ─── PASTE YOUR APPS SCRIPT URL HERE ───────────────────────────────
const SHEET_URL = "YOUR_APPS_SCRIPT_URL_HERE";
// ────────────────────────────────────────────────────────────────────

const G = {
  gold: "#C9A84C", goldLight: "rgba(201,168,76,0.10)", goldBorder: "rgba(201,168,76,0.35)",
  bg: "#0e0e0e", bg2: "#161616", text: "#f0ead6", muted: "#777", border: "#252525",
  green: "#4ecb71", blue: "#5badff", red: "#e85d5d", amber: "#f0a500",
};

const STEPS = ["Personal info","Body stats","Health","Goals & lifestyle","The real why","Fitness test","Results"];

function Chip({ label, selected, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding:"10px 16px", borderRadius:8, cursor:"pointer", outline:"none",
      border: selected ? `1.5px solid ${G.gold}` : `1px solid ${G.border}`,
      background: selected ? G.goldLight : G.bg2,
      color: selected ? G.gold : G.muted,
      fontSize:13, fontWeight: selected ? 600 : 400, transition:"all 0.18s",
    }}>{label}</button>
  );
}

function Field({ label, value, onChange, type="text", placeholder, hint }) {
  const [focused, setFocused] = useState(false);
  const base = { width:"100%", background:G.bg2, border:`1px solid ${focused?G.gold:G.border}`, color:G.text, padding:"12px 14px", borderRadius:8, outline:"none", transition:"border-color 0.2s", boxSizing:"border-box" };
  return (
    <div style={{ marginBottom:20 }}>
      <label style={{ display:"block", fontSize:11, letterSpacing:"0.1em", textTransform:"uppercase", color:G.muted, marginBottom:8 }}>{label}</label>
      {type==="textarea"
        ? <textarea value={value} onChange={onChange} placeholder={placeholder} onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)} style={{ ...base, fontSize:14, resize:"vertical", minHeight:80 }} />
        : <input type={type} value={value} onChange={onChange} placeholder={placeholder} onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)} style={{ ...base, fontSize:15 }} />
      }
      {hint && <p style={{ fontSize:11, color:G.muted, marginTop:5 }}>{hint}</p>}
    </div>
  );
}

function ChipGroup({ label, options, selected, onSelect }) {
  return (
    <div style={{ marginBottom:22 }}>
      <p style={{ fontSize:11, letterSpacing:"0.1em", textTransform:"uppercase", color:G.muted, marginBottom:10 }}>{label}</p>
      <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
        {options.map(o => <Chip key={o} label={o} selected={selected===o} onClick={()=>onSelect(o)} />)}
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, color }) {
  return (
    <div style={{ background:G.bg2, border:`1px solid ${G.border}`, borderRadius:12, padding:"16px", flex:1 }}>
      <p style={{ fontSize:11, letterSpacing:"0.08em", textTransform:"uppercase", color:G.muted, marginBottom:6 }}>{label}</p>
      <p style={{ fontSize:26, fontWeight:700, color:color||G.text, fontFamily:"'Playfair Display', serif", margin:0 }}>{value}</p>
      {sub && <p style={{ fontSize:12, color:G.muted, marginTop:4 }}>{sub}</p>}
    </div>
  );
}

function ScoreBar({ score }) {
  let color=G.red, level="Beginner";
  if(score>=80){color=G.green;level="Advanced";}
  else if(score>=55){color=G.gold;level="Intermediate";}
  else if(score>=30){color=G.amber;level="Beginner+";}
  return (
    <div style={{ background:G.bg2, border:`1px solid ${G.border}`, borderRadius:12, padding:16, marginBottom:16 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
        <p style={{ fontSize:11, letterSpacing:"0.08em", textTransform:"uppercase", color:G.muted }}>Fitness level</p>
        <span style={{ background:color+"22", color, border:`1px solid ${color}55`, borderRadius:6, padding:"4px 12px", fontSize:13, fontWeight:600 }}>{level}</span>
      </div>
      <div style={{ height:6, background:G.border, borderRadius:3, overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${score}%`, background:color, borderRadius:3, transition:"width 1s ease" }} />
      </div>
      <p style={{ fontSize:12, color:G.muted, marginTop:8, textAlign:"right" }}>{score}/100</p>
    </div>
  );
}

function SaveStatus({ status }) {
  if (!status) return null;
  const cfg = {
    saving: { color:G.amber,  text:"⏳ Saving to Google Sheets..." },
    saved:  { color:G.green,  text:"✅ Saved to Google Sheets" },
    error:  { color:G.red,    text:"⚠️ Could not save — check your Sheet URL in App.jsx" },
  };
  const c = cfg[status];
  return <div style={{ background:c.color+"18", border:`1px solid ${c.color}44`, borderRadius:8, padding:"10px 14px", fontSize:13, color:c.color, marginBottom:14, textAlign:"center" }}>{c.text}</div>;
}

function calcBMI(h,w){ const hm=parseFloat(h)/100,wk=parseFloat(w); if(!hm||!wk)return null; return (wk/(hm*hm)).toFixed(1); }
function bmiInfo(b){ const v=parseFloat(b); if(v<18.5)return{label:"Underweight",color:G.blue}; if(v<25)return{label:"Healthy",color:G.green}; if(v<30)return{label:"Overweight",color:G.amber}; return{label:"Obese",color:G.red}; }
function calcTDEE(age,gender,h,w,act){ const a=parseFloat(age),hv=parseFloat(h),wv=parseFloat(w); if(!a||!hv||!wv||!gender)return null; const bmr=gender==="Female"?(10*wv+6.25*hv-5*a-161):(10*wv+6.25*hv-5*a+5); return Math.round(bmr*({Sedentary:1.2,Light:1.375,Moderate:1.55,"Very active":1.725}[act]||1.375)); }
function calcScore(pu,pl,fl,br){ const p=parseInt(pu)||0,pk=parseInt(pl)||0; let s=0; if(p>=25)s+=30;else if(p>=15)s+=22;else if(p>=8)s+=14;else if(p>=3)s+=7; if(pk>=90)s+=25;else if(pk>=60)s+=18;else if(pk>=30)s+=12;else if(pk>=10)s+=6; if(fl==="Touch toes")s+=25;else if(fl==="Reach shins")s+=16;else if(fl==="Only knees")s+=8; if(br==="Never")s+=20;else if(br==="Sometimes")s+=12;else s+=4; return s; }
function getProg(goal,days,weight,tdee){ const d=days||"3",w=parseFloat(weight)||70; const p={"Fat loss":{name:"Fat Loss Accelerator",split:"Full Body Circuit + Cardio",cal:tdee?tdee-400:null,protein:Math.round(w*1.9),tip:"1.8–2g protein per kg. Compound movements first."},"Muscle gain":{name:"Muscle Builder",split:"Push / Pull / Legs",cal:tdee?tdee+250:null,protein:Math.round(w*2.1),tip:"Progressive overload every week. Prioritise sleep."},"Toning":{name:"Tone & Sculpt",split:"Upper / Lower + Core",cal:tdee?tdee-150:null,protein:Math.round(w*1.8),tip:"Controlled reps, moderate resistance. Consistency wins."},"General fitness":{name:"General Fitness",split:"Full Body Functional",cal:tdee,protein:Math.round(w*1.6),tip:"Balance mobility, strength, and cardio."}}; return p[goal]||p["General fitness"]; }
function fmtPhone(raw){ let p=raw.replace(/\D/g,""); if(p.startsWith("00"))p=p.slice(2); if(p.startsWith("0"))p="971"+p.slice(1); if(!p.startsWith("971")&&p.length<=10)p="971"+p; return p; }

function buildWA({name,bmi,bmiLabel,tdee,score,prog,days,timing,eqs}){
  const today=new Date().toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"});
  let lv="Beginner"; if(score>=80)lv="Advanced";else if(score>=55)lv="Intermediate";else if(score>=30)lv="Beginner+";
  let m=`*Your Fitness Assessment Results*\nBy @coachwaseemoden\n📅 ${today}\n\n━━━━━━━━━━━━━━━\n👤 *Client:* ${name}\n`;
  if(bmi)m+=`📊 *BMI:* ${bmi} (${bmiLabel})\n`;
  if(tdee)m+=`🔥 *Maintenance calories:* ${tdee} kcal/day\n`;
  m+=`💪 *Fitness score:* ${score}/100 (${lv})\n\n━━━━━━━━━━━━━━━\n🎯 *Your Program: ${prog.name}*\n\nSplit: ${prog.split}\nSessions: ${days||"3"}x/week\n`;
  if(prog.cal)m+=`Calorie target: ${prog.cal} kcal/day\n`;
  m+=`Protein target: ${prog.protein}g/day\n`;
  if(timing)m+=`Training time: ${timing}\n`;
  m+=`\n💡 ${prog.tip}\n\n`;
  const f=eqs.filter(e=>e.a.trim());
  if(f.length>0){m+=`━━━━━━━━━━━━━━━\n❤️ *Your Why*\n\n`;f.forEach(e=>{m+=`"${e.a}"\n\n`;});}
  m+=`━━━━━━━━━━━━━━━\nReady to start your transformation?\nReply *YES* to confirm your first session. 🚀`;
  return m;
}

async function saveToSheets(data){
  if(!SHEET_URL||SHEET_URL==="YOUR_APPS_SCRIPT_URL_HERE")return "error";
  try{ await fetch(`${SHEET_URL}?${new URLSearchParams(data).toString()}`,{method:"GET",mode:"no-cors"}); return "saved"; }
  catch{ return "error"; }
}

export default function App(){
  const [step,setStep]=useState(0);
  const [saveStatus,setSaveStatus]=useState(null);
  const saved=useRef(false);

  const [name,setName]=useState("");       const [age,setAge]=useState("");
  const [gender,setGender]=useState("");   const [phone,setPhone]=useState("");
  const [height,setHeight]=useState("");   const [weight,setWeight]=useState("");
  const [injuries,setInjuries]=useState(""); const [medical,setMedical]=useState(""); const [medication,setMedication]=useState("");
  const [goal,setGoal]=useState("");       const [activity,setActivity]=useState("");
  const [diet,setDiet]=useState("");       const [sleep,setSleep]=useState("");       const [water,setWater]=useState("");
  const [eq1,setEq1]=useState("");         const [eq2,setEq2]=useState("");
  const [eq3,setEq3]=useState("");         const [eq4,setEq4]=useState("");
  const [eq5,setEq5]=useState("");         const [eq6,setEq6]=useState("");
  const [pushups,setPushups]=useState(""); const [plank,setPlank]=useState("");
  const [flex,setFlex]=useState("");       const [breathless,setBreathless]=useState("");
  const [days,setDays]=useState("");       const [timing,setTiming]=useState("");

  const bmi=calcBMI(height,weight);
  const bmiD=bmi?bmiInfo(bmi):null;
  const tdee=calcTDEE(age,gender,height,weight,activity);
  const score=calcScore(pushups,plank,flex,breathless);
  const prog=getProg(goal,days,weight,tdee);
  let level="Beginner"; if(score>=80)level="Advanced";else if(score>=55)level="Intermediate";else if(score>=30)level="Beginner+";

  const eqs=[
    {q:"Last time felt confident",a:eq1},{q:"If nothing changes in a year",a:eq2},
    {q:"What they tell themselves in mirror",a:eq3},{q:"Why they stopped before",a:eq4},
    {q:"First thing with dream body",a:eq5},{q:"Who else this is for",a:eq6},
  ];

  const waMsg=buildWA({name,bmi,bmiLabel:bmiD?.label,tdee,score,prog,days,timing,eqs});
  const waLink=`https://wa.me/${fmtPhone(phone)}?text=${encodeURIComponent(waMsg)}`;

  useEffect(()=>{
    if(step===6&&!saved.current){
      saved.current=true;
      setSaveStatus("saving");
      saveToSheets({
        date:new Date().toLocaleDateString("en-GB"),
        name,phone,age,gender,height,weight,
        bmi:bmi||"",bmiLabel:bmiD?.label||"",
        injuries,medical,medication,
        goal,activity,diet,sleep,water,
        fitnessScore:score,fitnessLevel:level,
        tdee:tdee||"",program:prog.name,
        calorieTarget:prog.cal||"",proteinTarget:prog.protein,
        days,timing,eq1,eq2,eq3,eq4,eq5,eq6,
      }).then(r=>setSaveStatus(r));
    }
  },[step]);

  function restart(){
    setStep(0);setSaveStatus(null);saved.current=false;
    [setName,setAge,setGender,setPhone,setHeight,setWeight,setInjuries,setMedical,setMedication,
     setGoal,setActivity,setDiet,setSleep,setWater,setEq1,setEq2,setEq3,setEq4,setEq5,setEq6,
     setPushups,setPlank,setFlex,setBreathless,setDays,setTiming].forEach(fn=>fn(""));
  }

  const T = (txt,style={}) => <p style={{margin:0,...style}}>{txt}</p>;

  return (
    <div style={{minHeight:"100vh",background:G.bg,display:"flex",justifyContent:"center",padding:"0 0 60px"}}>
      <div style={{width:"100%",maxWidth:520,padding:"32px 20px"}}>

        {/* Header */}
        <div style={{marginBottom:32,borderBottom:`1px solid ${G.border}`,paddingBottom:24}}>
          <p style={{fontSize:10,letterSpacing:"0.2em",color:G.gold,textTransform:"uppercase",marginBottom:6}}>@coachwaseemoden</p>
          <h1 style={{margin:0,fontSize:28,fontFamily:"'Playfair Display', serif",color:G.text,fontWeight:700}}>Client Assessment</h1>
          <p style={{margin:"6px 0 0",fontSize:13,color:G.muted}}>Professional fitness evaluation & program design</p>
        </div>

        {/* Progress */}
        <div style={{marginBottom:32}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
            <span style={{fontSize:12,color:G.muted}}>Step {step+1} of 7</span>
            <span style={{fontSize:12,fontWeight:600,color:G.gold}}>{STEPS[step]}</span>
          </div>
          <div style={{height:3,background:G.border,borderRadius:2,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${((step+1)/7)*100}%`,background:G.gold,borderRadius:2,transition:"width 0.4s ease"}}/>
          </div>
        </div>

        {step===0&&<div>
          <h2 style={{fontFamily:"'Playfair Display', serif",fontSize:20,color:G.text,marginBottom:24}}>Personal Details</h2>
          <Field label="Full name" value={name} onChange={e=>setName(e.target.value)} placeholder="Client's full name"/>
          <Field label="Age" type="number" value={age} onChange={e=>setAge(e.target.value)} placeholder="e.g. 28"/>
          <ChipGroup label="Gender" options={["Male","Female"]} selected={gender} onSelect={setGender}/>
          <Field label="WhatsApp number" type="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+971 50 000 0000" hint="Assessment results will be sent to this number"/>
        </div>}

        {step===1&&<div>
          <h2 style={{fontFamily:"'Playfair Display', serif",fontSize:20,color:G.text,marginBottom:24}}>Body Statistics</h2>
          <Field label="Height (cm)" type="number" value={height} onChange={e=>setHeight(e.target.value)} placeholder="e.g. 170"/>
          <Field label="Weight (kg)" type="number" value={weight} onChange={e=>setWeight(e.target.value)} placeholder="e.g. 75"/>
          {bmi&&bmiD&&<div style={{background:G.bg2,border:`1px solid ${bmiD.color}44`,borderRadius:12,padding:"16px 20px",marginTop:8}}>
            <p style={{fontSize:11,color:G.muted,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:6}}>BMI Result</p>
            <div style={{display:"flex",alignItems:"baseline",gap:12}}>
              <span style={{fontSize:32,fontWeight:700,color:bmiD.color,fontFamily:"'Playfair Display', serif"}}>{bmi}</span>
              <span style={{fontSize:14,color:bmiD.color,fontWeight:600}}>{bmiD.label}</span>
            </div>
          </div>}
        </div>}

        {step===2&&<div>
          <h2 style={{fontFamily:"'Playfair Display', serif",fontSize:20,color:G.text,marginBottom:8}}>Health Screening</h2>
          <p style={{fontSize:13,color:G.muted,marginBottom:24}}>Essential for safe program design</p>
          <ChipGroup label="Injuries or joint pain?" options={["None","Knee","Back","Shoulder","Other"]} selected={injuries} onSelect={setInjuries}/>
          <ChipGroup label="Any medical conditions?" options={["None","Diabetes","Blood pressure","Heart condition","Other"]} selected={medical} onSelect={setMedical}/>
          <ChipGroup label="Currently on medication?" options={["No","Yes"]} selected={medication} onSelect={setMedication}/>
        </div>}

        {step===3&&<div>
          <h2 style={{fontFamily:"'Playfair Display', serif",fontSize:20,color:G.text,marginBottom:24}}>Goals & Lifestyle</h2>
          <ChipGroup label="Primary goal" options={["Fat loss","Muscle gain","Toning","General fitness"]} selected={goal} onSelect={setGoal}/>
          <ChipGroup label="Current activity level" options={["Sedentary","Light","Moderate","Very active"]} selected={activity} onSelect={setActivity}/>
          <ChipGroup label="Diet type" options={["Non-veg","Vegetarian","Vegan"]} selected={diet} onSelect={setDiet}/>
          <ChipGroup label="Average sleep per night" options={["Under 5h","5–7h","7h+"]} selected={sleep} onSelect={setSleep}/>
          <ChipGroup label="Daily water intake" options={["Under 1.5L","1.5–2.5L","2.5L+"]} selected={water} onSelect={setWater}/>
        </div>}

        {step===4&&<div>
          <h2 style={{fontFamily:"'Playfair Display', serif",fontSize:20,color:G.text,marginBottom:8}}>The Real Why</h2>
          <p style={{fontSize:13,color:G.muted,marginBottom:24}}>Type their answers in their own words — appears in their WhatsApp results</p>
          <Field label='"When was the last time you felt truly confident in your body?"' type="textarea" value={eq1} onChange={e=>setEq1(e.target.value)} placeholder="Their answer..."/>
          <Field label='"If nothing changes a year from now — how does that feel?"' type="textarea" value={eq2} onChange={e=>setEq2(e.target.value)} placeholder="Their answer..."/>
          <Field label='"What do you tell yourself when you look in the mirror?"' type="textarea" value={eq3} onChange={e=>setEq3(e.target.value)} placeholder="Their answer..."/>
          <Field label={`"You've probably tried before. What made you stop?"`} type="textarea" value={eq4} onChange={e=>setEq4(e.target.value)} placeholder="Their answer..."/>
          <Field label={`"If I gave you your dream body tomorrow — what's the first thing you'd do?"`} type="textarea" value={eq5} onChange={e=>setEq5(e.target.value)} placeholder="Their answer..."/>
          <Field label='"Who else is this for, other than yourself?"' type="textarea" value={eq6} onChange={e=>setEq6(e.target.value)} placeholder="Their answer..."/>
        </div>}

        {step===5&&<div>
          <h2 style={{fontFamily:"'Playfair Display', serif",fontSize:20,color:G.text,marginBottom:8}}>Fitness Test</h2>
          <p style={{fontSize:13,color:G.muted,marginBottom:24}}>Done live during the trial — record exactly what you see</p>
          <Field label="Max push-ups in one go" type="number" value={pushups} onChange={e=>setPushups(e.target.value)} placeholder="Number of reps"/>
          <Field label="Plank hold (seconds)" type="number" value={plank} onChange={e=>setPlank(e.target.value)} placeholder="e.g. 45"/>
          <ChipGroup label="Flexibility — standing forward bend" options={["Touch toes","Reach shins","Only knees"]} selected={flex} onSelect={setFlex}/>
          <ChipGroup label="Gets breathless climbing stairs?" options={["Never","Sometimes","Always"]} selected={breathless} onSelect={setBreathless}/>
          <ChipGroup label="Days available per week" options={["2","3","4","5+"]} selected={days} onSelect={setDays}/>
          <ChipGroup label="Preferred training time" options={["Morning","Afternoon","Evening"]} selected={timing} onSelect={setTiming}/>
        </div>}

        {step===6&&<div>
          <h2 style={{fontFamily:"'Playfair Display', serif",fontSize:22,color:G.text,marginBottom:4}}>{name?`${name}'s Results`:"Assessment Results"}</h2>
          <p style={{fontSize:13,color:G.muted,marginBottom:24}}>Complete fitness profile & program</p>

          <SaveStatus status={saveStatus}/>

          <div style={{display:"flex",gap:12,marginBottom:16,flexWrap:"wrap"}}>
            {bmi&&<StatCard label="BMI" value={bmi} sub={bmiD?.label} color={bmiD?.color}/>}
            {tdee&&<StatCard label="Daily calories" value={tdee} sub="Maintenance TDEE" color={G.gold}/>}
          </div>

          <ScoreBar score={score}/>

          <div style={{background:G.bg2,border:`1px solid ${G.goldBorder}`,borderRadius:14,padding:"20px",marginBottom:16}}>
            <p style={{fontSize:10,letterSpacing:"0.15em",textTransform:"uppercase",color:G.gold,marginBottom:6}}>Recommended Program</p>
            <p style={{fontSize:18,fontWeight:700,color:G.text,fontFamily:"'Playfair Display', serif",marginBottom:16}}>{prog.name}</p>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              {[["Split",prog.split],["Sessions/week",(days||"3")+"x"],prog.cal?["Calorie target",`${prog.cal} kcal/day`]:null,["Protein target",`${prog.protein}g/day`],timing?["Training time",timing]:null].filter(Boolean).map(([k,v])=>(
                <tr key={k}><td style={{color:G.muted,padding:"5px 0",width:"50%"}}>{k}</td><td style={{color:G.text,padding:"5px 0",textAlign:"right"}}>{v}</td></tr>
              ))}
            </table>
            <div style={{marginTop:14,paddingTop:14,borderTop:`1px solid ${G.border}`}}>
              <p style={{fontSize:12,color:G.muted}}>💡 {prog.tip}</p>
            </div>
          </div>

          {eqs.filter(e=>e.a.trim()).length>0&&<div style={{marginBottom:24}}>
            <p style={{fontSize:13,fontWeight:600,color:G.text,marginBottom:12}}>❤️ Their Why</p>
            {eqs.filter(e=>e.a.trim()).map((e,i)=>(
              <div key={i} style={{background:G.bg2,borderRadius:10,padding:"14px 16px",marginBottom:10}}>
                <p style={{fontSize:11,color:G.muted,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4}}>{e.q}</p>
                <p style={{fontSize:14,color:G.text,fontStyle:"italic"}}>"{e.a}"</p>
              </div>
            ))}
          </div>}

          {phone
            ?<a href={waLink} target="_blank" rel="noreferrer" style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,width:"100%",background:"#25D366",color:"#fff",borderRadius:10,padding:"16px",fontSize:16,fontWeight:600,textDecoration:"none",marginBottom:12,boxSizing:"border-box"}}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Send results to {name}
            </a>
            :<div style={{background:G.goldLight,border:`1px solid ${G.goldBorder}`,borderRadius:10,padding:14,marginBottom:12,textAlign:"center",fontSize:13,color:G.gold}}>⚠️ No WhatsApp number — go back to step 1</div>
          }

          <button onClick={restart} style={{width:"100%",background:G.bg2,border:`1px solid ${G.border}`,color:G.muted,borderRadius:10,padding:"14px",fontSize:14,cursor:"pointer"}}>
            + New client assessment
          </button>
        </div>}

        {step>0&&step<6&&<div style={{display:"flex",gap:12,marginTop:32}}>
          <button onClick={()=>setStep(s=>s-1)} style={{flex:1,background:G.bg2,border:`1px solid ${G.border}`,color:G.muted,borderRadius:10,padding:"14px",fontSize:14,cursor:"pointer"}}>← Back</button>
          <button onClick={()=>setStep(s=>s+1)} style={{flex:2,background:G.gold,border:"none",color:"#0e0e0e",borderRadius:10,padding:"14px",fontSize:15,fontWeight:700,cursor:"pointer"}}>{step===5?"View Results →":"Next →"}</button>
        </div>}
        {step===0&&<button onClick={()=>setStep(1)} style={{width:"100%",background:G.gold,border:"none",color:"#0e0e0e",borderRadius:10,padding:"14px",fontSize:15,fontWeight:700,cursor:"pointer",marginTop:32}}>Next →</button>}

      </div>
    </div>
  );
}
