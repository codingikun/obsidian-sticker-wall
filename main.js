"use strict";var $=Object.defineProperty;var W=Object.getOwnPropertyDescriptor;var A=Object.getOwnPropertyNames;var H=Object.prototype.hasOwnProperty;var G=(l,c)=>{for(var t in c)$(l,t,{get:c[t],enumerable:!0})},R=(l,c,t,e)=>{if(c&&typeof c=="object"||typeof c=="function")for(let n of A(c))!H.call(l,n)&&n!==t&&$(l,n,{get:()=>c[n],enumerable:!(e=W(c,n))||e.enumerable});return l};var B=l=>R($({},"__esModule",{value:!0}),l);var V={};G(V,{default:()=>C});module.exports=B(V);var N=require("obsidian");var x=require("obsidian");var T="sticker-wall.md",k=["rgba(253, 216, 53, 0.7)","rgba(255, 112, 67, 0.7)","rgba(100, 181, 246, 0.7)","rgba(129, 199, 132, 0.7)","rgba(255, 235, 59, 0.7)"],f={title:"sticker",content:"sticker content",addButton:"add"};var O=/^```stickers-data\n([\s\S]*?)\n```$/m;function P(l){let c=O.exec(l);if(c&&c[1])try{return JSON.parse(c[1])}catch(t){return console.error("Failed to parse stickers data:",t),[]}return[]}function I(l){return"```stickers-data\n"+JSON.stringify(l,null,2)+"\n```"}function F(){return crypto.randomUUID()}function M(l){let c=l.getFullYear(),t=String(l.getMonth()+1).padStart(2,"0"),e=String(l.getDate()).padStart(2,"0"),n=String(l.getHours()).padStart(2,"0"),o=String(l.getMinutes()).padStart(2,"0"),i=String(l.getSeconds()).padStart(2,"0");return`${c}-${t}-${e} ${n}:${o}:${i}`}function _(l){if(!l||l.trim()==="")return T;let c=l.trim();return c.endsWith("/")||(c+="/"),c+T}var b="sticker-wall-view",E=class extends x.ItemView{constructor(t,e,n){super(e);this.notes=[];this.stickerContainerEl=null;this.notesContainerEl=null;this.ghostNote=null;this.plugin=n}getViewType(){return b}getDisplayText(){return"Sticker Wall"}async onOpen(){this.render(),await this.loadNotes()}async onClose(){}async loadNotes(){try{let t=_(this.plugin.settings.dataFolder),e=this.app.vault.getAbstractFileByPath(t);if(e&&e instanceof x.TFile){let n=await this.app.vault.read(e);this.notes=P(n)}else this.notes=[],await this.saveNotes();this.renderNotes()}catch(t){console.error("Failed to load notes:",t),this.notes=[]}}async saveNotes(){try{let t=_(this.plugin.settings.dataFolder),e=this.app.vault.getAbstractFileByPath(t),n=I(this.notes);if(e&&e instanceof x.TFile){let o=await this.app.vault.read(e),i=this.replaceStickersBlock(o,n);await this.app.vault.modify(e,i)}else{let o=n+`

# \u8D34\u7EB8\u5899

*\u5728\u8FD9\u91CC\u6DFB\u52A0\u4F60\u7684\u8D34\u7EB8*
`;await this.app.vault.create(t,o)}}catch(t){console.error("Failed to save notes:",t),new x.Notice("Save failed!")}}replaceStickersBlock(t,e){let n="```stickers-data",o=new RegExp(n+"\\n[\\s\\S]*?\\n```","m");return o.test(t)?t.replace(o,e):e+`

`+t}render(){let t=this.contentEl;t.innerHTML="";let e=document.createElement("style");e.textContent=this.getStyles(),t.appendChild(e);let n=document.createElement("div");n.className="sticker-wall";let o=document.createElement("div");o.className="sticker-container",this.notesContainerEl=o,o.addEventListener("contextmenu",i=>{i.preventDefault();let s=o.getBoundingClientRect(),a=i.clientX-s.left,r=i.clientY-s.top;this.createGhostSticker(a,r)}),document.addEventListener("keydown",i=>{i.key==="Escape"&&this.ghostNote&&this.removeGhostSticker()}),n.appendChild(o),t.appendChild(n)}createGhostSticker(t,e){this.removeGhostSticker();let n=this.notesContainerEl;if(!n)return;let o=k[Math.floor(Math.random()*k.length)],i=k.filter(g=>g!==o),s=i.length>0?i[Math.floor(Math.random()*i.length)]:o,a=document.createElement("div");a.className="sticker-note ghost",a.style.left=t+"px",a.style.top=e+"px",a.style.backgroundColor=o;let r=document.createElement("div");r.className="tape",r.style.backgroundColor=s;let p=document.createElement("button");p.className="delete-btn",p.textContent="\xD7",p.addEventListener("click",()=>this.removeGhostSticker());let h=document.createElement("div");h.className="note-header";let u=document.createElement("span");u.className="username",u.contentEditable="true",u.textContent=f.title;let m=document.createElement("span");m.className="time",m.textContent=M(new Date),h.appendChild(u),h.appendChild(m);let d=document.createElement("div");d.className="note-content editing",d.contentEditable="true",d.dataset.placeholder=f.content,d.textContent="",d.addEventListener("keydown",g=>{if(g.key==="Enter"&&!g.shiftKey){g.preventDefault(),g.stopPropagation();let v=d.innerHTML,S=u.textContent||f.title;this.addNote(S,v,t,e,o,s),this.removeGhostSticker()}g.key==="Escape"&&(g.preventDefault(),this.removeGhostSticker())}),d.addEventListener("blur",()=>{setTimeout(()=>{this.ghostNote&&!a.contains(document.activeElement)&&this.removeGhostSticker()},100)}),a.appendChild(p),a.appendChild(r),a.appendChild(h),a.appendChild(d),n.appendChild(a),this.ghostNote={el:a,x:t,y:e,color:o,tapeColor:s},d.focus()}removeGhostSticker(){this.ghostNote&&(this.ghostNote.el.remove(),this.ghostNote=null)}getStyles(){return`
      body {
        margin: 0;
        padding: 0;
        font-family: "\u5FAE\u8F6F\u96C5\u9ED1", "Arial", sans-serif;
        background: #dfe6e9;
      }
      .sticker-wall {
        width: 100%;
        height: 100%;
        background: #dfe6e9;
        display: flex;
        flex-direction: column;
      }
      .sticker-input-area {
        position: absolute;
        z-index: 100;
        background: rgba(255, 255, 255, 0.95);
        padding: 10px;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        display: none;
        flex-direction: column;
        gap: 8px;
        width: 300px;
      }
      .sticker-input-area input.title-input {
        width: 100%;
        padding: 12px;
        font-size: 16px;
        border: 1px solid #ccc;
        border-radius: 5px;
        box-sizing: border-box;
      }
      .sticker-input-area .content-editor {
        width: 100%;
        min-height: 120px;
        padding: 12px;
        font-size: 14px;
        font-family: 'Comic Sans MS', cursive, sans-serif;
        border: 1px solid #ccc;
        border-radius: 5px;
        background: #fff;
        outline: none;
        box-sizing: border-box;
        resize: vertical;
      }
      .sticker-input-area .content-editor:focus {
        border-color: #4caf50;
      }
      .sticker-container {
        position: relative;
        width: 100%;
        height: 100%;
        overflow: auto;
        box-sizing: border-box;
      }
      .sticker-note {
        position: absolute;
        width: 250px;
        min-height: 150px;
        border: 1px solid rgba(0,0,0,0.1);
        border-radius: 4px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        padding: 20px 15px;
        padding-top: 20px;
        cursor: move;
        user-select: none;
      }
      /* \u7EB5\u5411\u80F6\u5E26\u8D34\u5728\u8D34\u7EB8\u9876\u90E8\u4E2D\u95F4 - \u4F7F\u7528\u8D34\u7EB8\u81EA\u5DF1\u7684 tapeColor */
      .sticker-note .tape {
        content: "";
        position: absolute;
        top: -10px;
        left: 50%;
        transform: translateX(-50%);
        width: 16px;
        height: 24px;
        border-radius: 2px;
        box-shadow: 0 1px 4px rgba(0,0,0,0.15);
      }
      .sticker-note:hover {
        box-shadow: 0 6px 12px rgba(0,0,0,0.3);
      }
      .sticker-note .delete-btn {
        position: absolute;
        top: 5px;
        right: 5px;
        width: 18px;
        height: 18px;
        border: none;
        background: transparent;
        color: rgba(0, 0, 0, 0.5);
        border-radius: 50%;
        cursor: pointer;
        font-size: 14px;
        line-height: 1;
        padding: 2px;
        opacity: 0;
        transition: opacity 0.2s, color 0.2s;
      }
      .sticker-note:hover .delete-btn { opacity: 1; }
      .sticker-note .delete-btn:hover { color: rgba(255, 0, 0, 0.8); }
      .sticker-note .note-header {
        font-family: 'Comic Sans MS', cursive, sans-serif;
        font-size: 12px;
        color: #555;
        margin-bottom: 10px;
        display: flex;
        justify-content: space-between;
      }
      .sticker-note .note-content {
        font-family: 'Comic Sans MS', cursive, sans-serif;
        font-size: 14px;
        color: #333;
        word-break: break-all;
        min-height: 20px;
        cursor: text;
        white-space: pre-wrap;
      }
      .sticker-note .note-content.editing {
        background: rgba(255, 255, 255, 0.3);
        border-radius: 4px;
        padding: 4px;
        margin: -4px;
        outline: none;
        white-space: pre-wrap;
      }
      .sticker-note .note-content .md-block {
        white-space: pre-wrap;
      }
      .sticker-note .note-content p { margin: 0 0 8px 0; }
      .sticker-note .note-content p:last-child { margin-bottom: 0; }
      .sticker-note .note-content strong { font-weight: bold; }
      .sticker-note .note-content em { font-style: italic; }
      .sticker-note .note-content code {
        background: rgba(0,0,0,0.1);
        padding: 2px 4px;
        border-radius: 3px;
        font-family: monospace;
      }
      .sticker-note .note-content pre {
        background: rgba(0,0,0,0.1);
        padding: 8px;
        border-radius: 4px;
        overflow-x: auto;
      }
      .sticker-note .note-content ul, .sticker-note .note-content ol {
        margin: 8px 0;
        padding-left: 20px;
      }
      .sticker-note .note-content a {
        color: #1976d2;
        text-decoration: underline;
      }
      .sticker-note .note-content h1,
      .sticker-note .note-content h2,
      .sticker-note .note-content h3 {
        margin: 8px 0;
        font-weight: bold;
      }
      .sticker-note .note-content h1 { font-size: 18px; }
      .sticker-note .note-content h2 { font-size: 16px; }
      .sticker-note .note-content h3 { font-size: 14px; }
      .sticker-note .note-content blockquote {
        border-left: 3px solid #ccc;
        padding-left: 10px;
        margin: 8px 0;
        color: #666;
      }
      .sticker-note .note-content del { text-decoration: line-through; }
      .sticker-note .note-content hr {
        border: none;
        border-top: 1px solid #ccc;
        margin: 8px 0;
      }
      .edit-hint {
        font-size: 10px;
        color: #999;
        text-align: center;
        margin-top: 8px;
        opacity: 0;
        transition: opacity 0.2s;
      }
      .sticker-note:hover .edit-hint { opacity: 1; }
      .sticker-note.ghost {
        opacity: 0.9;
        animation: ghost-pulse 1s infinite;
      }
      .sticker-note.ghost .delete-btn { opacity: 1; }
      @keyframes ghost-pulse {
        0%, 100% { box-shadow: 0 4px 8px rgba(0,0,0,0.2); }
        50% { box-shadow: 0 4px 16px rgba(0,0,0,0.3); }
      }
      .note-header .username {
        outline: none;
        cursor: text;
        padding: 2px 4px;
        border-radius: 3px;
        margin: -2px -4px;
      }
      .note-header .username:focus {
        background: rgba(255, 255, 255, 0.3);
      }
    `}addNote(t,e,n,o,i,s){var v,S;let a=e.replace(/<br\s*\/?>/gi,`
`).replace(/<div[^>]*>/gi,`
`).replace(/<\/div>/gi,"").replace(/<p[^>]*>/gi,"").replace(/<\/p>/gi,`

`).replace(/&nbsp;/gi," ").replace(/\n{3,}/g,`

`).trim();if(!a.replace(/<[^>]*>/g,"").trim()&&!t.trim())return;let p=new Date,h=((v=this.notesContainerEl)==null?void 0:v.clientWidth)||800,u=((S=this.notesContainerEl)==null?void 0:S.clientHeight)||600,m=i||k[Math.floor(Math.random()*k.length)],d=s||(()=>{let L=k.filter(z=>z!==m);return L.length>0?L[Math.floor(Math.random()*L.length)]:m})(),g={id:F(),userName:t.trim()||f.title,content:a,time:M(p),x:n??Math.random()*(h-270),y:o??Math.random()*(u-220),rotate:Math.random()*20-10,color:m,tapeColor:d};this.notes=[...this.notes,g],this.saveNotes(),this.renderNotes(),new x.Notice("Sticker added!")}async renderNotes(){if(this.notesContainerEl){this.notesContainerEl.innerHTML="";for(let t of this.notes){let e=document.createElement("div");e.className="sticker-note",e.style.left=t.x+"px",e.style.top=t.y+"px",e.style.backgroundColor=t.color,e.style.transform="rotate("+t.rotate+"deg)";let n=document.createElement("button");n.className="delete-btn",n.textContent="\xD7",n.addEventListener("click",p=>{p.stopPropagation(),this.deleteNote(t.id)});let o=document.createElement("div");o.className="tape",o.style.backgroundColor=t.tapeColor;let i=document.createElement("div");i.className="note-header";let s=document.createElement("span");s.className="username",s.contentEditable="true",s.textContent=t.userName,s.addEventListener("blur",()=>{var h;let p=((h=s.textContent)==null?void 0:h.trim())||f.title;p!==t.userName&&(t.userName=p,this.updateNoteContent(t))}),s.addEventListener("keydown",p=>{p.key==="Enter"&&(p.preventDefault(),s.blur())});let a=document.createElement("span");a.className="time",a.textContent=t.time,i.appendChild(s),i.appendChild(a);let r=document.createElement("div");r.className="note-content",r.contentEditable="true",r.dataset.noteId=t.id,r.innerHTML=this.renderMarkdown(t.content),r.addEventListener("focus",()=>{r.classList.add("editing")}),r.addEventListener("blur",()=>{r.classList.remove("editing");let p=r.innerHTML;p!==this.renderMarkdown(t.content)&&(t.content=this.htmlToMarkdown(p),this.updateNoteContent(t)),r.innerHTML=this.renderMarkdown(t.content)}),r.addEventListener("keydown",p=>{p.key==="Escape"&&r.blur()}),e.appendChild(n),e.appendChild(o),e.appendChild(i),e.appendChild(r),this.setupDrag(e,t),this.notesContainerEl.appendChild(e)}}}renderMarkdown(t){let e=t;e=e.replace(/<br\s*\/?>/gi,`
`),e=e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");let n=new RegExp("```(\\w*)\\n([\\s\\S]*?)```","g");e=e.replace(n,(a,r,p)=>"<pre><code>"+p.trim()+"</code></pre>"),e=e.replace(/`([^`]+)`/g,"<code>$1</code>"),e=e.replace(/^### (.+)$/gm,"<h3>$1</h3>"),e=e.replace(/^## (.+)$/gm,"<h2>$1</h2>"),e=e.replace(/^# (.+)$/gm,"<h1>$1</h1>"),e=e.replace(/\*\*\*(.+?)\*\*\*/g,"<strong><em>$1</em></strong>"),e=e.replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>"),e=e.replace(/\*(.+?)\*/g,"<em>$1</em>"),e=e.replace(/___(.+?)___/g,"<strong><em>$1</em></strong>"),e=e.replace(/__(.+?)__/g,"<strong>$1</strong>"),e=e.replace(/_(.+?)_/g,"<em>$1</em>"),e=e.replace(/~~(.+?)~~/g,"<del>$1</del>"),e=e.replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2" target="_blank">$1</a>'),e=e.replace(/^[\s]*[-*] (.+)$/gm,"<li>$1</li>"),e=e.replace(/(<li>.*<\/li>\n?)+/g,"<ul>$&</ul>"),e=e.replace(/^[\s]*\d+\. (.+)$/gm,"<li>$1</li>"),e=e.replace(/^> (.+)$/gm,"<blockquote>$1</blockquote>"),e=e.replace(/^---$/gm,"<hr>");let o=e.split(`
`),i=[],s=[];for(let a of o){let r=a.trim();r===""?s.length>0?(i.push("<p>"+s.join(" ")+"</p><br>"),s=[]):i.push("<br>"):r.startsWith("<")&&r.endsWith(">")?(s.length>0&&(i.push("<p>"+s.join(" ")+"</p>"),s=[]),i.push(r)):s.push(r)}return s.length>0&&i.push("<p>"+s.join(" ")+"</p>"),i.join(`
`)}htmlToMarkdown(t){let e=t;return e=e.replace(/<br\s*\/?>/gi,`
`),e=e.replace(/<\/p>/gi,`

`),e=e.replace(/<p[^>]*>/gi,""),e=e.replace(/<h1[^>]*>(.*?)<\/h1>/gi,`# $1
`),e=e.replace(/<h2[^>]*>(.*?)<\/h2>/gi,`## $1
`),e=e.replace(/<h3[^>]*>(.*?)<\/h3>/gi,`### $1
`),e=e.replace(/<strong><em>(.*?)<\/em><\/strong>/gi,"***$1***"),e=e.replace(/<strong>(.*?)<\/strong>/gi,"**$1**"),e=e.replace(/<em>(.*?)<\/em>/gi,"*$1*"),e=e.replace(/<b>(.*?)<\/b>/gi,"**$1**"),e=e.replace(/<i>(.*?)<\/i>/gi,"*$1*"),e=e.replace(/<del>(.*?)<\/del>/gi,"~~$1~~"),e=e.replace(/<s>(.*?)<\/s>/gi,"~~$1~~"),e=e.replace(/<code>(.*?)<\/code>/gi,"`$1`"),e=e.replace(/<pre><code>(.*?)<\/code><\/pre>/gi,"```\n$1\n```"),e=e.replace(/<a[^>]*href=["']([^"']*)["'][^>]*>(.*?)<\/a>/gi,"[$2]($1)"),e=e.replace(/<li>(.*?)<\/li>/gi,`- $1
`),e=e.replace(/<\/?ul[^>]*>/gi,""),e=e.replace(/<\/?ol[^>]*>/gi,""),e=e.replace(/<blockquote>(.*?)<\/blockquote>/gi,`> $1
`),e=e.replace(/<hr\s*\/?>/gi,`---
`),e=e.replace(/<[^>]+>/g,""),e=e.replace(/&amp;/g,"&"),e=e.replace(/&lt;/g,"<"),e=e.replace(/&gt;/g,">"),e=e.replace(/&quot;/g,'"'),e=e.replace(/&nbsp;/g," "),e=e.replace(/\n{3,}/g,`

`),e=e.trim(),e}setupDrag(t,e){let n=0,o=0,i=0,s=0,a=!1;t.addEventListener("mousedown",r=>{let p=r.target;if(p.classList.contains("delete-btn")||p.classList.contains("note-content"))return;n=r.clientX,o=r.clientY,i=e.x,s=e.y,a=!1;let h=m=>{let d=m.clientX-n,g=m.clientY-o;(Math.abs(d)>3||Math.abs(g)>3)&&(a=!0),a&&(e.x=i+d,e.y=s+g,t.style.left=e.x+"px",t.style.top=e.y+"px")},u=()=>{a&&this.updateNotePosition(e),document.removeEventListener("mousemove",h),document.removeEventListener("mouseup",u)};document.addEventListener("mousemove",h),document.addEventListener("mouseup",u)})}updateNoteContent(t){this.notes=this.notes.map(e=>e.id===t.id?t:e),this.saveNotes(),new x.Notice("Sticker saved!")}updateNotePosition(t){this.notes=this.notes.map(e=>e.id===t.id?t:e),this.saveNotes()}deleteNote(t){this.notes=this.notes.filter(e=>e.id!==t),this.saveNotes(),this.renderNotes(),new x.Notice("Sticker deleted!")}};var y=require("obsidian"),D={dataFolder:""},w=class extends y.PluginSettingTab{constructor(c,t){super(c,t),this.plugin=t}display(){let{containerEl:c}=this;c.empty(),c.createEl("h2",{text:"\u8D34\u7EB8\u5899\u8BBE\u7F6E"}),new y.Setting(c).setName("\u6570\u636E\u4FDD\u5B58\u76EE\u5F55").setDesc("\u8BBE\u7F6E\u8D34\u7EB8\u5899\u6570\u636E\u6587\u4EF6\u7684\u4FDD\u5B58\u76EE\u5F55\uFF0C\u7559\u7A7A\u8868\u793A\u6839\u76EE\u5F55\u3002\u4F8B\u5982\uFF1AStickers/").addText(t=>{t.setValue(this.plugin.settings.dataFolder).onChange(async e=>{this.plugin.settings.dataFolder=e,await this.plugin.saveSettings()}),t.inputEl.style.width="300px"})}};var C=class extends N.Plugin{constructor(){super(...arguments);this.settings=D}async onload(){console.log("Sticker Wall plugin loading..."),await this.loadSettings(),this.addSettingTab(new w(this.app,this)),this.registerView(b,t=>new E(this.app,t,this)),this.addCommand({id:"open-sticker-wall",name:"\u6253\u5F00\u8D34\u7EB8\u5899",callback:()=>{this.activateView()}}),this.addRibbonIcon("sticky-note","\u6253\u5F00\u8D34\u7EB8\u5899",()=>{this.activateView()}),console.log("Sticker Wall plugin loaded")}onunload(){console.log("Sticker Wall plugin unloaded")}async loadSettings(){let t=await this.loadData();this.settings={...D,...t}}async saveSettings(){await this.saveData(this.settings)}async activateView(){let{workspace:t}=this.app,e=t.getLeavesOfType(b);if(e.length>0){t.revealLeaf(e[0]);return}let n=t.getLeaf("tab");n?(await n.setViewState({type:b}),t.revealLeaf(n)):new N.Notice("\u65E0\u6CD5\u6253\u5F00\u8D34\u7EB8\u5899\uFF01")}};
