import { ISLANDS_DARK } from './theme'

/** Shiki, loaded by the page from esm.sh; pinned, so a page never changes under the person. */
export const SHIKI_VERSION = '4.5.0'

/**
 * The mod's page, whole. The hub serves it inside its shell; /hub.js gives it `window.hub`.
 * A raw template: backslashes stay as written, and there is no dollar-brace and no backtick in here.
 * Every render is morphed into the DOM that is there, so switching variants, files or diff modes changes only what changed.
 */
const SOURCE = String.raw`<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Варианты</title>
<link rel="stylesheet" href="/hub.css">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap">
<style>
:root{
  --bg:#F6F5F1;--surface:#FFFFFF;--surface2:#F0EEE9;--border:#E4E1DA;--border2:#D3CFC6;--text:#1E1D1A;--muted:#5F5D57;--faint:#6F6D66;
  --claude:#B9552F;--claude-soft:rgba(185,85,47,.08);--claude-line:rgba(185,85,47,.42);
  --sugg:#4351C7;--sugg-soft:rgba(67,81,199,.07);--sugg-line:rgba(67,81,199,.42);--ring:rgba(67,81,199,.18);
  --hi:#B3301F;--hi-soft:rgba(190,52,39,.06);--hi-line:rgba(190,52,39,.32);
  --warn:#8F5B00;--warn-soft:rgba(214,152,20,.09);--warn-dot:#D69814;--warn-line:rgba(214,152,20,.55);
  --ok:#2A7A3D;--ok-soft:rgba(42,122,61,.07);--ok-line:rgba(42,122,61,.32);--on-accent:#FFFFFF;
  --shadow:0 1px 2px rgba(30,25,10,.04),0 6px 20px rgba(30,25,10,.05);
  --f-sans:Inter,system-ui,-apple-system,'Segoe UI',sans-serif;--f-mono:'JetBrains Mono',ui-monospace,monospace;
}
:root[data-theme="dark"]{
  --bg:#121211;--surface:#1A1A19;--surface2:#242422;--border:#2B2B29;--border2:#3A3A37;--text:#EDECE8;--muted:#A6A59F;--faint:#8F8E88;
  --claude:#E3845F;--claude-soft:rgba(227,132,95,.10);--claude-line:rgba(227,132,95,.45);
  --sugg:#AEB6FA;--sugg-soft:rgba(174,182,250,.09);--sugg-line:rgba(174,182,250,.5);--ring:rgba(174,182,250,.22);
  --hi:#F2826F;--hi-soft:rgba(242,130,111,.085);--hi-line:rgba(242,130,111,.42);
  --warn:#F2B735;--warn-soft:rgba(242,183,53,.07);--warn-dot:#F2B735;--warn-line:rgba(242,183,53,.42);
  --ok:#66C47A;--ok-soft:rgba(102,196,122,.07);--ok-line:rgba(102,196,122,.32);--on-accent:#17120F;--shadow:0 1px 2px rgba(0,0,0,.35);color-scheme:dark;
}
@media (prefers-color-scheme: dark){
  :root:not([data-theme="light"]){
    --bg:#121211;--surface:#1A1A19;--surface2:#242422;--border:#2B2B29;--border2:#3A3A37;--text:#EDECE8;--muted:#A6A59F;--faint:#8F8E88;
    --claude:#E3845F;--claude-soft:rgba(227,132,95,.10);--claude-line:rgba(227,132,95,.45);
    --sugg:#AEB6FA;--sugg-soft:rgba(174,182,250,.09);--sugg-line:rgba(174,182,250,.5);--ring:rgba(174,182,250,.22);
    --hi:#F2826F;--hi-soft:rgba(242,130,111,.085);--hi-line:rgba(242,130,111,.42);
    --warn:#F2B735;--warn-soft:rgba(242,183,53,.07);--warn-dot:#F2B735;--warn-line:rgba(242,183,53,.42);
    --ok:#66C47A;--ok-soft:rgba(102,196,122,.07);--ok-line:rgba(102,196,122,.32);--on-accent:#17120F;--shadow:0 1px 2px rgba(0,0,0,.35);color-scheme:dark;
  }
}
*{box-sizing:border-box}
html,body{margin:0;background:var(--bg);color:var(--text);font:14px/1.5 var(--f-sans)}
button{font:inherit;color:inherit}
button:focus-visible,textarea:focus-visible,input:focus-visible{outline:2px solid var(--sugg);outline-offset:2px}
.mono{font-family:var(--f-mono);font-variant-ligatures:none}
.lbl{font-size:11px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--faint)}
.muted{color:var(--muted)}
.hdr{border-bottom:1px solid var(--border);background:var(--bg)}
.hdr .in{max-width:1440px;margin:0 auto;padding:14px 24px;display:flex;flex-wrap:wrap;align-items:center;gap:12px 20px}
.logo{width:36px;height:36px;border-radius:10px;background:var(--claude-soft);color:var(--claude);display:grid;place-items:center;flex:none}
.hdr h1{margin:0;font-size:17px;font-weight:650;letter-spacing:-.015em;line-height:1.25}
.pill{display:inline-flex;align-items:center;gap:8px;height:30px;padding:0 12px;border-radius:999px;font-size:12.5px;font-weight:550;border:1px solid var(--ok-line);background:var(--ok-soft);color:var(--ok)}
.pill.off{border-color:var(--warn-line);background:var(--warn-soft);color:var(--warn)}
.pill .dot{width:7px;height:7px;border-radius:50%;background:currentColor}
main{max-width:1440px;margin:0 auto;padding:24px 24px 64px;display:flex;flex-direction:column;gap:20px}
.card{border:1px solid var(--border);background:var(--surface);border-radius:16px;box-shadow:var(--shadow)}
.task{padding:18px 20px 20px;display:flex;flex-direction:column;gap:14px}
.chip{display:inline-flex;align-items:center;gap:6px;height:22px;padding:0 9px;border-radius:999px;font-size:12px;font-weight:600}
.chip .d{width:6px;height:6px;border-radius:50%;background:currentColor}
.chip.bug{background:var(--hi-soft);color:var(--hi)}
.chip.feature{background:var(--sugg-soft);color:var(--sugg)}
.ref{font-family:var(--f-mono);font-size:12px;font-weight:600;background:var(--surface2);border-radius:7px;padding:2px 8px}
.task h2{margin:0;font-size:21px;line-height:1.3;font-weight:650;letter-spacing:-.015em}
.task p{margin:0;font-size:15px;line-height:1.6;max-width:80ch}
code.c{font-family:var(--f-mono);font-size:.88em;background:var(--surface2);padding:1px 6px;border-radius:6px;font-variant-ligatures:none}
.steps{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:8px}
.steps li{display:flex;gap:10px;align-items:flex-start;padding:10px 12px;border-radius:12px;background:var(--surface2);font-size:13.5px}
.steps li.last{background:var(--hi-soft);border:1px solid var(--hi-line)}
.steps .n{width:22px;height:22px;border-radius:7px;flex:none;display:grid;place-items:center;font-family:var(--f-mono);font-size:11.5px;font-weight:600;background:var(--surface);color:var(--muted)}
.steps li.last .n{background:var(--hi);color:var(--on-accent)}
.cols{display:flex;flex-wrap:wrap;gap:20px;align-items:flex-start}
.left{flex:999 1 600px;min-width:0;display:flex;flex-direction:column;gap:16px}
.bar{display:flex;flex-wrap:wrap;align-items:flex-end;gap:10px 16px;padding:2px}
.seg{display:inline-flex;padding:3px;gap:2px;background:var(--surface2);border-radius:10px}
.seg button{height:30px;border-radius:8px;font-weight:550;cursor:pointer;border:0;white-space:nowrap;padding:0 12px;font-size:13px;background:transparent;color:var(--muted)}
.seg button[aria-pressed="true"]{background:var(--surface);color:var(--text);box-shadow:var(--shadow)}
.seg.grow{display:flex}
.seg.grow button{flex:1 1 auto;min-width:0;padding:0 8px;font-size:12.5px;overflow:hidden;text-overflow:ellipsis}
.vgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px}
.vcard{text-align:left;cursor:pointer;min-height:150px;display:flex;flex-direction:column;gap:8px;padding:14px;border-radius:14px;background:var(--surface);border:1px solid var(--border)}
.vcard[aria-pressed="true"]{border-color:var(--sugg-line);box-shadow:0 0 0 3px var(--ring),var(--shadow)}
.key{width:24px;height:24px;border-radius:7px;display:grid;place-items:center;font-family:var(--f-mono);font-size:12px;font-weight:600;background:var(--surface2);color:var(--muted);flex:none}
.vcard[aria-pressed="true"] .key{background:var(--sugg);color:var(--surface)}
.tag{display:inline-flex;align-items:center;gap:4px;height:20px;padding:0 8px;border-radius:999px;font-size:11.5px;font-weight:600}
.tag.rec{background:var(--claude-soft);color:var(--claude)}
.tag.built{background:var(--surface2);color:var(--muted)}
.tag.ok{background:var(--ok-soft);color:var(--ok)}
.vcard .t{font-size:14.5px;font-weight:600;line-height:1.35}
.vcard .s{font-size:12.5px;color:var(--muted);line-height:1.45}
.vcard .nums{display:flex;gap:10px;align-items:center;font-family:var(--f-mono);font-size:12px;margin-top:auto}
.add{color:var(--ok)}.del{color:var(--hi)}.fnt{color:var(--faint)}
.ghost{border:1px dashed var(--border2);background:transparent;border-radius:14px;padding:14px;min-height:150px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;color:var(--muted);font-size:13px;cursor:pointer}
.prep{border:1px dashed var(--claude-line);background:var(--claude-soft);border-radius:14px;padding:14px;display:flex;flex-direction:column;gap:8px;min-height:150px}
.prep .k{width:24px;height:24px;border-radius:7px;display:grid;place-items:center;font-family:var(--f-mono);font-size:12px;font-weight:600;background:var(--surface);color:var(--claude)}
.prep .bar1,.prep .bar2{height:8px;border-radius:4px;background:var(--border2);opacity:.6}
.detail{border:1px solid var(--sugg-line);background:var(--surface);border-radius:16px;box-shadow:0 0 0 4px var(--ring),var(--shadow);display:flex;flex-direction:column}
.detail .body{padding:18px 20px 20px;display:flex;flex-direction:column;gap:22px}
.bigkey{width:36px;height:36px;border-radius:10px;display:grid;place-items:center;font-family:var(--f-mono);font-size:15px;font-weight:600;background:var(--sugg);color:var(--surface);flex:none}
.detail h3{margin:0;font-size:19px;line-height:1.35;font-weight:650;letter-spacing:-.015em}
.meta{display:inline-flex;gap:6px;align-items:center;height:24px;padding:0 9px;border-radius:8px;border:1px solid var(--border);font-size:12px;color:var(--muted)}
.meta b{color:var(--text);font-weight:600}
.btn{height:34px;border-radius:9px;padding:0 12px;font-size:13px;font-weight:550;display:inline-flex;align-items:center;gap:7px;border:1px solid var(--border);background:var(--surface);color:var(--text);cursor:pointer}
.btn.big{height:38px;padding:0 13px}
.btn.pri{border-color:var(--claude);background:var(--claude);color:var(--on-accent);font-weight:600}
.btn.flat{border-color:transparent;background:transparent;color:var(--muted)}
.btn:disabled{opacity:.5;cursor:not-allowed}
.banner{display:flex;flex-wrap:wrap;gap:10px 12px;align-items:center;padding:12px 14px;border-radius:12px;font-size:13.5px}
.banner.ok{border:1px solid var(--ok-line);background:var(--ok-soft)}
.banner.warn{border:1px solid var(--warn-line);background:var(--warn-soft)}
.banner .grow{flex:1 1 260px;min-width:0}
.essence{margin:0;font-size:15.5px;line-height:1.6;max-width:72ch;white-space:pre-line}
.pc{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px}
.pc section{border-radius:12px;padding:12px 14px;display:flex;flex-direction:column;gap:8px}
.pc .pros{border:1px solid var(--ok-line);background:var(--ok-soft)}
.pc .cons{border:1px solid var(--hi-line);background:var(--hi-soft)}
.pc ul{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:7px}
.pc li{display:flex;gap:10px;font-size:13.5px;line-height:1.5}
.pc li .m{flex:none;font-family:var(--f-mono);font-weight:600}
.fbadges{display:flex;flex-wrap:wrap;gap:6px}
.fb{display:inline-flex;align-items:center;gap:8px;height:30px;padding:0 10px 0 5px;border-radius:8px;font-family:var(--f-mono);font-size:12px;cursor:pointer;border:1px solid var(--border);background:var(--surface);color:var(--muted)}
.fb[aria-pressed="true"]{border-color:var(--sugg);background:var(--sugg-soft);color:var(--text)}
.fb .st{width:20px;height:20px;border-radius:5px;display:grid;place-items:center;font-size:11px;font-weight:600}
.st.A{background:var(--ok-soft);color:var(--ok)}.st.M{background:var(--sugg-soft);color:var(--sugg)}.st.D{background:var(--hi-soft);color:var(--hi)}
.code{background:#191A1C;border:1px solid #2B2D30;border-radius:14px;overflow:hidden;color:#BCBEC4;font-family:var(--f-mono);font-variant-ligatures:none;font-feature-settings:"liga" 0,"calt" 0}
.code .top{display:flex;flex-wrap:wrap;align-items:center;gap:10px;padding:8px 10px 8px 14px;background:#1E1F22;border-bottom:1px solid #2B2D30}
.code .path{font-size:12.5px;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1 1 200px}
.iseg{display:inline-flex;padding:2px;gap:2px;background:#2B2D30;border-radius:8px}
.iseg button{height:26px;border-radius:6px;padding:0 10px;font-family:var(--f-sans);font-size:12px;font-weight:550;cursor:pointer;border:0;display:inline-flex;align-items:center;gap:6px;background:transparent;color:#A8ABB0}
.iseg button[aria-pressed="true"]{background:#43454A;color:#DFE1E5}
.sides{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));background:#1E1F22;border-bottom:1px solid #2B2D30;font-family:var(--f-sans);font-size:11.5px;color:#8C8F96}
.sides div{padding:6px 14px}.sides div:first-child{border-right:1px solid #2B2D30}
.scroll{max-height:560px;overflow:auto;font-size:12.5px;line-height:20px}
.rows{min-width:max-content;padding:4px 0}
.row{display:flex;height:20px}
.row.a{background:rgba(84,160,96,.17)}.row.d{background:rgba(220,85,85,.15)}
.row.f{background:repeating-linear-gradient(135deg,transparent 0 6px,rgba(255,255,255,.035) 6px 7px)}
.row .no{width:44px;flex:none;text-align:right;padding-right:8px;color:#6F737A}
.row button.no{border:0;background:transparent;color:#7A7E85;cursor:pointer;padding:0 8px 0 0;font:inherit}
.row button.no:hover{color:#DFE1E5}
.row .mk{width:22px;flex:none;text-align:center}
.row.a .mk{color:#6AAB73}.row.d .mk{color:#F0787D}
.row .tx{white-space:pre;padding-right:24px}
.skip{display:flex;align-items:center;gap:10px;width:100%;height:28px;padding:0 0 0 14px;border:0;background:#20232A;color:#8C8F96;font-size:12px;cursor:pointer;text-align:left;font-family:var(--f-mono)}
.skip .go{color:#56A8F5}
.split{display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}
.split>div{overflow-x:auto}.split>div:first-child{border-right:1px solid #2B2D30}
.code .foot{display:flex;flex-wrap:wrap;gap:6px 14px;padding:7px 14px;background:#1E1F22;border-top:1px solid #2B2D30;font-family:var(--f-sans);font-size:11.5px;color:#8C8F96}
.code .wait{padding:22px 16px;display:flex;flex-direction:column;gap:10px;font-family:var(--f-sans);font-size:13px;color:#A8ABB0}
.code .wait .ln{height:9px;border-radius:4px;background:#2B2D30}
.code .err{padding:16px;font-family:var(--f-sans);font-size:13px;color:#F0787D;display:flex;flex-direction:column;gap:10px;align-items:flex-start}
.whats{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:6px}
.whats li{display:flex;gap:10px;align-items:baseline;font-size:13.5px;line-height:1.5}
.whats .fn{font-family:var(--f-mono);font-size:12px;color:var(--muted);flex:none;max-width:45%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.code .pick{padding:22px 16px;display:flex;flex-direction:column;gap:12px;align-items:flex-start;font-family:var(--f-sans);font-size:13px;color:#A8ABB0;max-width:70ch}
.code .pick .btns{display:flex;flex-wrap:wrap;gap:8px}
.dbtn{height:32px;border-radius:8px;padding:0 12px;font-family:var(--f-sans);font-size:12.5px;font-weight:550;cursor:pointer;border:1px solid #43454A;background:#2B2D30;color:#DFE1E5;display:inline-flex;align-items:center;gap:7px}
.dbtn.pri{border-color:#56A8F5;background:rgba(86,168,245,.12);color:#9CCBFA}
.sk .row .no{color:#4E5157}
.sknote{padding:6px 14px;background:#1E1F22;border-bottom:1px solid #2B2D30;font-family:var(--f-sans);font-size:11.5px;color:#8C8F96}
.actions{border-top:1px solid var(--border);padding:12px 20px 14px;display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.ctable{border:1px solid var(--border);border-radius:12px;overflow-x:auto}
.ctable .in{min-width:560px}
.crow{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;align-items:center;padding:10px 14px;border-bottom:1px solid var(--border)}
.crow.head{padding:8px 14px;background:var(--surface2)}
.crow:last-child{border-bottom:0}
.crow .p{font-family:var(--f-mono);font-size:12.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.opts{display:inline-flex;padding:3px;gap:2px;background:var(--surface2);border-radius:9px}
.opts button{min-width:36px;height:28px;border-radius:7px;padding:0 9px;font-family:var(--f-mono);font-size:12px;font-weight:600;border:0;background:transparent;color:var(--muted);cursor:pointer}
.opts button[aria-pressed="true"]{background:var(--sugg);color:var(--surface)}
.opts button:disabled{color:var(--border2);cursor:not-allowed}
.note{display:flex;gap:12px;align-items:flex-start;padding:12px 14px;border-radius:12px;font-size:13.5px}
.note.warn{border:1px solid var(--warn-line);background:var(--warn-soft)}
.note.ok{border:1px solid var(--ok-line);background:var(--ok-soft)}
textarea.in{width:100%;border:1px solid var(--border);background:var(--surface);color:var(--text);border-radius:10px;font:inherit;font-size:14px;padding:10px 12px;resize:vertical}
textarea.codein{width:100%;border:1px solid #2B2D30;background:#191A1C;color:#BCBEC4;border-radius:12px;font-family:var(--f-mono);font-size:12.5px;line-height:1.55;padding:10px 12px;resize:vertical;min-height:110px}
label.chk{display:inline-flex;align-items:center;gap:7px;font-size:13px;color:var(--muted);cursor:pointer}
aside.chat{flex:1 1 360px;min-width:0;max-width:100%;position:sticky;top:16px;height:min(940px,calc(100vh - 32px));display:flex;flex-direction:column;overflow:hidden}
.chat .head{display:flex;align-items:center;gap:10px;padding:12px 14px;border-bottom:1px solid var(--border)}
.chat .av0{width:30px;height:30px;border-radius:50%;background:var(--claude-soft);color:var(--claude);display:grid;place-items:center;flex:none}
.cnt{font-family:var(--f-mono);font-size:12px;color:var(--sugg);background:var(--sugg-soft);border-radius:999px;padding:1px 8px}
.msgs{flex:1 1 auto;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:14px}
.msg{display:flex;gap:10px;align-items:flex-start}
.msg .av{width:28px;height:28px;border-radius:50%;flex:none;display:grid;place-items:center;font-size:11px;font-weight:650;background:var(--surface2);color:var(--muted)}
.msg.c .av{background:var(--claude-soft);color:var(--claude)}
.msg .col{flex:1;min-width:0;display:flex;flex-direction:column;gap:6px}
.msg .who{font-size:12px;color:var(--muted)}
.msg .who b{font-weight:600;color:var(--text)}
.msg.c .who b{color:var(--claude)}
.bub{align-self:flex-start;max-width:100%;white-space:pre-line;font-size:13.5px;line-height:1.55;padding:8px 12px;border-radius:4px 12px 12px 12px;background:var(--surface2);border:1px solid transparent;overflow-wrap:anywhere}
.msg.c .bub{background:var(--claude-soft);border-color:var(--claude-line)}
.msg.n .bub{background:var(--warn-soft);border-color:var(--warn-line)}
pre.blk{margin:4px 0;background:#191A1C;border:1px solid #2B2D30;border-radius:10px;overflow-x:auto;padding:8px 12px;font-family:var(--f-mono);font-size:12px;line-height:19px;color:#BCBEC4;white-space:pre}
.rchips{display:flex;flex-wrap:wrap;gap:4px}
.rchip{display:inline-flex;align-items:center;gap:4px;height:22px;padding:0 8px;border-radius:7px;border:1px solid var(--sugg-line);background:var(--sugg-soft);color:var(--sugg);font-family:var(--f-mono);font-size:11.5px}
.rchip button{width:20px;height:20px;border:0;background:transparent;color:var(--sugg);cursor:pointer;display:grid;place-items:center;padding:0;border-radius:5px}
.mact{height:30px;border-radius:8px;padding:0 10px;font-size:12.5px;font-weight:550;border:1px solid var(--claude-line);background:var(--surface);color:var(--claude);cursor:pointer;align-self:flex-start}
.typing{display:flex;gap:10px;align-items:center}
.typing .t{display:inline-flex;align-items:center;gap:8px;background:var(--surface2);border-radius:4px 12px 12px 12px;padding:8px 12px;font-size:13px;color:var(--muted)}
.typing .dots{display:inline-flex;gap:4px}
.typing .dots i{width:5px;height:5px;border-radius:50%;background:var(--warn-dot);animation:pulse 1.2s infinite}
.typing .dots i:nth-child(2){animation-delay:.2s}.typing .dots i:nth-child(3){animation-delay:.4s}
@keyframes pulse{0%,100%{opacity:.3}50%{opacity:1}}
@media (prefers-reduced-motion: reduce){.typing .dots i{animation:none}}
.composer{border-top:1px solid var(--border);padding:12px 14px 14px;display:flex;flex-direction:column;gap:10px;background:var(--surface)}
.ach{height:28px;border-radius:999px;padding:0 11px;font-size:12.5px;font-weight:500;cursor:pointer;border:1px solid var(--border);background:var(--surface);color:var(--muted)}
.ach[aria-pressed="true"]{border-color:var(--sugg);background:var(--sugg-soft);color:var(--sugg)}
.empty{padding:40px 28px;display:flex;flex-direction:column;gap:12px;align-items:flex-start;max-width:720px}
.empty h2{margin:0;font-size:20px;font-weight:650}
.empty p{margin:0;color:var(--muted);font-size:14.5px;line-height:1.6}
@media (max-width:720px){main{padding:16px 16px 48px}.hdr .in{padding:12px 16px}aside.chat{position:static;height:640px}}
</style>
</head>
<body>
<div id="app"></div>
<script>window.VARIANTS_THEME = __THEME__;</script>
<script type="module">
  try {
    const base = 'https://esm.sh/shiki@__SHIKI__'
    const [core, engine, langs] = await Promise.all([import(base + '/core'), import(base + '/engine/javascript'), import(base + '/langs')])
    const highlighter = await core.createHighlighterCore({ themes: [window.VARIANTS_THEME], langs: [], engine: engine.createJavaScriptRegexEngine({ forgiving: true }) })
    window.variantsShiki = { highlighter, languages: langs.bundledLanguages }
  } catch (error) {
    window.variantsShiki = null
  }
  window.dispatchEvent(new Event('variants:shiki'))
</script>
<script src="/hub.js"></script>
<script>
(function () {
'use strict'

var TEXTS = {
  ru: {
    title: 'Варианты решения', branch: 'ветка', online: 'Подключено к сессии Claude', offline: 'Сессия не слушает', hubDown: 'Хаб недоступен',
    bug: 'Баг', feature: 'Фича', variants: 'Варианты реализации', count: function (n) { return n + ' ' + pl(n, 'вариант', 'варианта', 'вариантов') }, recommends: function (k) { return 'Claude рекомендует ' + k },
    detail: 'Подробно', combine: 'Скомбинировать', rec: 'Рекомендую', built: 'Сборка', chosen: 'Выбран', applied: 'Применён',
    files: function (n) { return n + ' ' + pl(n, 'файл', 'файла', 'файлов') }, noCode: 'код по запросу', askAlt: 'Попросить другой вариант', preparing: 'Claude готовит вариант…',
    askAbout: 'Спросить про вариант', essence: 'Суть подхода', pros: 'Плюсы', cons: 'Минусы', touched: 'Затронутые файлы',
    diff: 'Дифф', full: 'Весь файл', unified: 'Единый', split: 'Бок о бок', before: 'Было', after: 'Стало',
    hidden: function (n) { return n + ' ' + pl(n, 'строка', 'строки', 'строк') + ' без изменений' }, showFull: 'Показать весь файл',
    refHint: 'Нажмите номер строки, чтобы сослаться на неё в чате', refLine: 'Сослаться на строку в чате',
    codeWait: 'Claude готовит код…', codeWaitSession: 'Claude пишет код в сессии…', codeQueued: 'Код в очереди…', codeError: 'Код не получен', regen: 'Получить код заново', getCode: 'Получить код',
    choose: function (k) { return 'Выбрать вариант ' + k }, isChosen: 'Вариант выбран', combineWith: 'Скомбинировать с другими', other: 'Другое решение', own: 'Предложить своё',
    chosenText: function (k, b) { return 'Выбран вариант ' + k + '. «Применить» запишет файлы в рабочую копию' + (b ? ' (ветка ' + b + ')' : '') + '. Claude узнает об этом с вашим следующим сообщением.' },
    unchoose: 'Отменить выбор', apply: 'Применить', runTests: 'Прогнать тесты варианта', waitCode: 'Ждём код',
    appliedText: function (k) { return 'Вариант ' + k + ' применён: файлы записаны на диск.' },
    drift: function (f) { return 'С момента предложения на диске изменились: ' + f + '. Код нужно получить заново по новой версии.' },
    tests: function (r) { return 'Тесты: ' + r.passed + ' ✓ / ' + r.failed + ' ✗ · ' + r.state }, openTests: 'Открыть тесты',
    combTitle: 'Сборка из вариантов', combText: 'Выберите, из какого варианта взять каждый файл. Сборка делается без модели; стыки Claude проверит, только если попросите.',
    file: 'Файл', from: 'Откуда взять', none: 'Нет', noneAria: 'Не менять файл', fromAria: function (k) { return 'Взять из варианта ' + k },
    onlyIn: function (ks) { return ks.length === 1 ? 'Только в ' + ks[0] : 'Есть в ' + ks.join(', ') },
    seam: function (p, k, q) { return p + ' из ' + k + ' использует ' + q + ' из ' + k + ', а этот файл не взят.' },
    waitFor: function (ks) { return 'Ждём код ' + ks.join(', ') + '.' }, compat: 'Явных разрывов не видно.', compatHint: 'Проверка простая, по именам файлов.',
    result: 'Получится', combNote: 'Что учесть при сборке', combPh: 'Например: очистку старых записей сделать командой', checkSeams: 'Проверить стыки с Claude (через сессию)',
    build: function (k) { return 'Собрать вариант ' + k }, cancel: 'Отмена',
    chat: 'Обсуждение с Claude', chatSub: 'Вопросы — быстро и без засорения чата; своё решение и новый вариант — через сессию',
    you: 'Вы', claude: 'Claude', now: 'сейчас', via: { quick: 'кратко', deep: 'полный контекст', session: 'сессия' },
    askDeep: 'Спросить с полным контекстом', thinking: 'Claude думает…', looking: 'Claude смотрит код…', queued: function (n) { return 'В очереди: ' + n + ' — ждём конца хода Claude' },
    cAsk: 'Вопрос', cOwn: 'Своё решение', cAlt: 'Другой вариант', constraints: 'Ограничения для нового варианта',
    alts: ['Без миграций', 'Минимум изменений', 'Без новых зависимостей', 'Через события', 'С тестами'],
    ph: { ask: 'Спросите про вариант или строку…', own: 'Опишите своё решение…', alt: 'Что ещё учесть в новом варианте…' },
    hint: { ask: 'Ответ коротко, без чата сессии', own: 'Claude оценит по коду в сессии', alt: 'Claude добавит вариант без кода' },
    send: { ask: 'Спросить', own: 'Обсудить', alt: 'Попросить' }, ownPh: '// Вставьте код или дифф своего решения', remove: 'Убрать',
    emptyTitle: 'Пока нет вариантов', emptyText: 'Попросите Claude в чате: «предложи варианты реализации …». Он покажет их здесь: суть, плюсы и минусы, файлы. Код каждого варианта страница получит сама, когда вы его откроете.',
    sent: 'Отправлено', noteLbl: 'Заметка',
    sketchBtn: 'Набросок', codeBtn: 'Показать код', sketchWait: 'Claude набрасывает псевдокод…', sketchError: 'Набросок не получен', retry: 'Ещё раз', sketchTag: 'набросок',
    sketchNote: 'Псевдокод: суть изменений, не точный код', pickDetail: 'Кода пока нет. Набросок — короткий псевдокод по файлам, это дёшево. Код — точный дифф, его стоит просить, когда вариант интересен.',
    chosenNoCode: function (k) { return 'Выбран вариант ' + k + '. Перед применением нужен код: получите его и посмотрите дифф.' }, getCode: 'Получить код',
    buildGet: function (k) { return 'Получить код и собрать ' + k }, seamLater: 'Проверка стыков появится, когда будет код выбранных вариантов.', building: 'Получаем код для сборки…'
  },
  en: {
    title: 'Implementation variants', branch: 'branch', online: 'Connected to the Claude session', offline: 'No session listens', hubDown: 'Hub is down',
    bug: 'Bug', feature: 'Feature', variants: 'Implementation variants', count: function (n) { return n + ' variant' + (n === 1 ? '' : 's') }, recommends: function (k) { return 'Claude recommends ' + k },
    detail: 'Detail', combine: 'Combine', rec: 'Recommended', built: 'Combined', chosen: 'Chosen', applied: 'Applied',
    files: function (n) { return n + ' file' + (n === 1 ? '' : 's') }, noCode: 'code on demand', askAlt: 'Ask for another variant', preparing: 'Claude is preparing a variant…',
    askAbout: 'Ask about it', essence: 'The approach', pros: 'Pros', cons: 'Cons', touched: 'Files touched',
    diff: 'Diff', full: 'Whole file', unified: 'Unified', split: 'Side by side', before: 'Before', after: 'After',
    hidden: function (n) { return n + ' unchanged line' + (n === 1 ? '' : 's') }, showFull: 'Show whole file',
    refHint: 'Click a line number to refer to it in the chat', refLine: 'Refer to this line in the chat',
    codeWait: 'Claude is writing the code…', codeWaitSession: 'Claude is writing the code in the session…', codeQueued: 'Code queued…', codeError: 'No code', regen: 'Fetch the code again', getCode: 'Get the code',
    choose: function (k) { return 'Choose variant ' + k }, isChosen: 'Variant chosen', combineWith: 'Combine with others', other: 'Another solution', own: 'Suggest my own',
    chosenText: function (k, b) { return 'Variant ' + k + ' is chosen. Apply writes its files to the working copy' + (b ? ' (branch ' + b + ')' : '') + '. Claude hears of it with your next message.' },
    unchoose: 'Unchoose', apply: 'Apply', runTests: 'Run the variant’s tests', waitCode: 'Waiting for the code',
    appliedText: function (k) { return 'Variant ' + k + ' is applied: the files are written.' },
    drift: function (f) { return 'Changed on disk since the variants were proposed: ' + f + '. Fetch the code again over the new version.' },
    tests: function (r) { return 'Tests: ' + r.passed + ' ✓ / ' + r.failed + ' ✗ · ' + r.state }, openTests: 'Open tests',
    combTitle: 'Combine variants', combText: 'Pick which variant each file comes from. Combining needs no model; Claude checks the seams only if you ask.',
    file: 'File', from: 'Take from', none: 'None', noneAria: 'Leave the file as is', fromAria: function (k) { return 'Take from variant ' + k },
    onlyIn: function (ks) { return ks.length === 1 ? 'Only in ' + ks[0] : 'In ' + ks.join(', ') },
    seam: function (p, k, q) { return p + ' from ' + k + ' uses ' + q + ' from ' + k + ', which is not taken.' },
    waitFor: function (ks) { return 'Waiting for the code of ' + ks.join(', ') + '.' }, compat: 'No obvious gaps.', compatHint: 'A simple check by file names.',
    result: 'Result', combNote: 'What to keep in mind', combPh: 'E.g. clean old rows with a command', checkSeams: 'Check the seams with Claude (through the session)',
    build: function (k) { return 'Build variant ' + k }, cancel: 'Cancel',
    chat: 'Discussion with Claude', chatSub: 'Questions are quick and stay out of the chat; your own solution and new variants go through the session',
    you: 'You', claude: 'Claude', now: 'now', via: { quick: 'quick', deep: 'whole conversation', session: 'session' },
    askDeep: 'Ask with the whole conversation', thinking: 'Claude is thinking…', looking: 'Claude is looking at the code…', queued: function (n) { return 'Queued: ' + n + ' — waiting for Claude’s turn to end' },
    cAsk: 'Question', cOwn: 'My solution', cAlt: 'Another variant', constraints: 'Constraints for the new variant',
    alts: ['No migrations', 'Fewest changes', 'No new dependencies', 'Through events', 'With tests'],
    ph: { ask: 'Ask about the variant or a line…', own: 'Describe your solution…', alt: 'What else the new variant should consider…' },
    hint: { ask: 'A short answer, outside the session chat', own: 'Claude judges it against the code', alt: 'Claude adds a variant without code' },
    send: { ask: 'Ask', own: 'Discuss', alt: 'Request' }, ownPh: '// Paste the code or diff of your solution', remove: 'Remove',
    emptyTitle: 'No variants yet', emptyText: 'Ask Claude in the chat: “propose implementation variants for …”. They show up here with their approach, pros, cons and files. The page fetches each variant’s code when you open it.',
    sent: 'Sent', noteLbl: 'Note',
    sketchBtn: 'Sketch', codeBtn: 'Show code', sketchWait: 'Claude is sketching pseudocode…', sketchError: 'No sketch', retry: 'Try again', sketchTag: 'sketch',
    sketchNote: 'Pseudocode: the gist of the changes, not exact code', pickDetail: 'No code yet. A sketch is short pseudocode per file and costs little. The code is the exact diff: ask for it when the variant interests you.',
    chosenNoCode: function (k) { return 'Variant ' + k + ' is chosen. Applying needs its code: get it and look at the diff first.' }, getCode: 'Get the code',
    buildGet: function (k) { return 'Get the code and build ' + k }, seamLater: 'The seams are checked once the code of the picked variants is in.', building: 'Getting the code to build…'
  },
  uk: {
    title: 'Варіанти рішення', branch: 'гілка', online: 'Підключено до сесії Claude', offline: 'Сесія не слухає', hubDown: 'Хаб недоступний',
    bug: 'Баг', feature: 'Фіча', variants: 'Варіанти реалізації', count: function (n) { return n + ' ' + pl(n, 'варіант', 'варіанти', 'варіантів') }, recommends: function (k) { return 'Claude радить ' + k },
    detail: 'Докладно', combine: 'Скомбінувати', rec: 'Раджу', built: 'Збірка', chosen: 'Обрано', applied: 'Застосовано',
    files: function (n) { return n + ' ' + pl(n, 'файл', 'файли', 'файлів') }, noCode: 'код на запит', askAlt: 'Попросити інший варіант', preparing: 'Claude готує варіант…',
    askAbout: 'Спитати про варіант', essence: 'Суть підходу', pros: 'Плюси', cons: 'Мінуси', touched: 'Зачеплені файли',
    diff: 'Дифф', full: 'Увесь файл', unified: 'Єдиний', split: 'Пліч-о-пліч', before: 'Було', after: 'Стало',
    hidden: function (n) { return n + ' ' + pl(n, 'рядок', 'рядки', 'рядків') + ' без змін' }, showFull: 'Показати весь файл',
    refHint: 'Натисніть номер рядка, щоб послатися на нього в чаті', refLine: 'Послатися на рядок у чаті',
    codeWait: 'Claude готує код…', codeWaitSession: 'Claude пише код у сесії…', codeQueued: 'Код у черзі…', codeError: 'Код не отримано', regen: 'Отримати код знову', getCode: 'Отримати код',
    choose: function (k) { return 'Обрати варіант ' + k }, isChosen: 'Варіант обрано', combineWith: 'Скомбінувати з іншими', other: 'Інше рішення', own: 'Запропонувати своє',
    chosenText: function (k, b) { return 'Обрано варіант ' + k + '. «Застосувати» запише файли в робочу копію' + (b ? ' (гілка ' + b + ')' : '') + '. Claude дізнається про це з вашим наступним повідомленням.' },
    unchoose: 'Скасувати вибір', apply: 'Застосувати', runTests: 'Прогнати тести варіанта', waitCode: 'Чекаємо код',
    appliedText: function (k) { return 'Варіант ' + k + ' застосовано: файли записано на диск.' },
    drift: function (f) { return 'Відтоді на диску змінилися: ' + f + '. Код треба отримати знову за новою версією.' },
    tests: function (r) { return 'Тести: ' + r.passed + ' ✓ / ' + r.failed + ' ✗ · ' + r.state }, openTests: 'Відкрити тести',
    combTitle: 'Збірка з варіантів', combText: 'Оберіть, з якого варіанта взяти кожен файл. Збірка робиться без моделі; стики Claude перевірить, лише якщо попросите.',
    file: 'Файл', from: 'Звідки взяти', none: 'Ні', noneAria: 'Не змінювати файл', fromAria: function (k) { return 'Взяти з варіанта ' + k },
    onlyIn: function (ks) { return ks.length === 1 ? 'Лише в ' + ks[0] : 'Є в ' + ks.join(', ') },
    seam: function (p, k, q) { return p + ' з ' + k + ' використовує ' + q + ' з ' + k + ', а цей файл не взято.' },
    waitFor: function (ks) { return 'Чекаємо код ' + ks.join(', ') + '.' }, compat: 'Явних розривів не видно.', compatHint: 'Перевірка проста, за іменами файлів.',
    result: 'Вийде', combNote: 'Що врахувати при збірці', combPh: 'Наприклад: очищення старих записів зробити командою', checkSeams: 'Перевірити стики з Claude (через сесію)',
    build: function (k) { return 'Зібрати варіант ' + k }, cancel: 'Скасувати',
    chat: 'Обговорення з Claude', chatSub: 'Питання — швидко й без засмічення чату; своє рішення й новий варіант — через сесію',
    you: 'Ви', claude: 'Claude', now: 'зараз', via: { quick: 'коротко', deep: 'повний контекст', session: 'сесія' },
    askDeep: 'Спитати з повним контекстом', thinking: 'Claude думає…', looking: 'Claude дивиться код…', queued: function (n) { return 'У черзі: ' + n + ' — чекаємо кінця ходу Claude' },
    cAsk: 'Питання', cOwn: 'Своє рішення', cAlt: 'Інший варіант', constraints: 'Обмеження для нового варіанта',
    alts: ['Без міграцій', 'Мінімум змін', 'Без нових залежностей', 'Через події', 'З тестами'],
    ph: { ask: 'Спитайте про варіант або рядок…', own: 'Опишіть своє рішення…', alt: 'Що ще врахувати в новому варіанті…' },
    hint: { ask: 'Коротка відповідь, поза чатом сесії', own: 'Claude оцінить за кодом у сесії', alt: 'Claude додасть варіант без коду' },
    send: { ask: 'Спитати', own: 'Обговорити', alt: 'Попросити' }, ownPh: '// Вставте код або дифф свого рішення', remove: 'Прибрати',
    emptyTitle: 'Поки немає варіантів', emptyText: 'Попросіть Claude у чаті: «запропонуй варіанти реалізації …». Він покаже їх тут: суть, плюси й мінуси, файли. Код кожного варіанта сторінка отримає сама, коли ви його відкриєте.',
    sent: 'Надіслано', noteLbl: 'Нотатка',
    sketchBtn: 'Начерк', codeBtn: 'Показати код', sketchWait: 'Claude робить начерк псевдокодом…', sketchError: 'Начерк не отримано', retry: 'Ще раз', sketchTag: 'начерк',
    sketchNote: 'Псевдокод: суть змін, не точний код', pickDetail: 'Коду поки немає. Начерк — короткий псевдокод по файлах, це дешево. Код — точний дифф, його варто просити, коли варіант цікавий.',
    chosenNoCode: function (k) { return 'Обрано варіант ' + k + '. Для застосування потрібен код: отримайте його й перегляньте дифф.' }, getCode: 'Отримати код',
    buildGet: function (k) { return 'Отримати код і зібрати ' + k }, seamLater: 'Перевірка стиків з’явиться, коли буде код обраних варіантів.', building: 'Отримуємо код для збірки…'
  }
}
function pl(n, a, b, c) { var m10 = n % 10, m100 = n % 100; if (m10 === 1 && m100 !== 11) return a; if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return b; return c }

var ICONS = {
  logo: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="5" cy="4.5" r="2"></circle><circle cx="5" cy="15.5" r="2"></circle><circle cx="15" cy="7.5" r="2"></circle><path d="M5 6.5v7"></path><path d="M15 9.5c0 3-4 3-8.6 5"></path></svg>',
  check: '<svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.5 6.2l2.3 2.3 4.7-5"></path></svg>',
  plus: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M10 4v12M4 10h12"></path></svg>',
  ask: '<svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true"><path d="M2.5 3.5h11v7h-6l-3 2.5v-2.5h-2z"></path></svg>',
  okc: '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="var(--ok)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex:none"><circle cx="9" cy="9" r="7"></circle><path d="M5.8 9.2l2.2 2.2 4.2-4.6"></path></svg>',
  warn: '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="var(--warn)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex:none;margin-top:1px"><path d="M9 2.5l7 12.5H2z"></path><path d="M9 7.5v3.5M9 13.2v.1"></path></svg>',
  file: '<svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="#7A7E85" stroke-width="1.4" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 1.8h6l3 3v9.4h-9z"></path><path d="M9.5 1.8v3h3"></path></svg>',
  uni: '<svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><rect x="2" y="2" width="10" height="10" rx="1.5"></rect><path d="M2 7h10"></path></svg>',
  spl: '<svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><rect x="2" y="2" width="10" height="10" rx="1.5"></rect><path d="M7 2v10"></path></svg>',
  fold: '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" aria-hidden="true"><path d="M3 4.5L6 2l3 2.5M3 7.5L6 10l3-2.5"></path></svg>',
  ok: '<svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 8.3l3 3 6-6.6"></path></svg>',
  merge: '<svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 3v3.5c0 2 1.5 3 5 3.5M13 3v3.5c0 2-1.5 3-5 3.5v3"></path></svg>',
  again: '<svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13 8a5 5 0 1 1-1.5-3.6M13 2.5v2.8h-2.8"></path></svg>',
  code: '<svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5.5 4.5L2 8l3.5 3.5M10.5 4.5L14 8l-3.5 3.5"></path></svg>',
  star: '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 1l1.3 4.2L13.5 4 10.6 7.2 15 8l-4.4.8 2.9 3.2-4.2-1.2L8 15l-1.3-4.2L2.5 12l2.9-3.2L1 8l4.4-.8L2.5 4l4.2 1.2z"></path></svg>',
  send: '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4"></path></svg>',
  x: '<svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="M2.5 2.5l5 5M7.5 2.5l-5 5"></path></svg>'
}

var state = { variants: [], bases: {}, chat: [], task: null, drift: [], news: [] }
var online = { hub: true, session: true }
var S = { mode: 'detail', cur: '', files: {}, view: 'diff', layout: 'unified', composer: 'ask', refs: [], alts: [], draft: '', ownCode: '', picks: {}, combNote: '', checkSeams: false, runTests: true, show: {}, pendingBuild: null, lastChat: 0 }

function $(id) { return document.getElementById(id) }
function T() { return TEXTS[hub.lang] || TEXTS.en }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] }) }
function inline(s) { return esc(s).replace(/\x60([^\x60\n]+)\x60/g, '<code class="c">$1</code>') }
function rich(s) {
  var parts = String(s || '').split(/\x60\x60\x60[a-z]*\n?/)
  return parts.map(function (p, i) { return i % 2 === 1 ? '<pre class="blk">' + esc(p.replace(/\n$/, '')) + '</pre>' : inline(p) }).join('')
}
function hhmm(ms) { if (!ms) return T().now; var d = new Date(ms); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0') }
function splitPath(p) { var i = p.lastIndexOf('/'); return { dir: p.slice(0, i + 1), name: p.slice(i + 1) } }
function variant(k) { return state.variants.filter(function (v) { return v.key === k })[0] || null }
function curVariant() {
  var v = variant(S.cur)
  if (!v) { v = variant(state.recommended) || state.variants[0] || null; S.cur = v ? v.key : '' }
  return v
}
function totals(v) { var a = 0, d = 0; for (var p in v.code.counts) { a += v.code.counts[p].add; d += v.code.counts[p].del } return { add: a, del: d } }
function send(data) { data.lang = hub.lang; return hub.send(data) }

/* ---------- morph: the render goes into the DOM that is there, node by node ---------- */
function keyOf(node) { return node.nodeType === 1 ? node.getAttribute('data-key') : null }
function morphNode(from, to) {
  var i, a
  for (i = from.attributes.length - 1; i >= 0; i--) { a = from.attributes[i]; if (!to.hasAttribute(a.name)) from.removeAttribute(a.name) }
  for (i = 0; i < to.attributes.length; i++) { a = to.attributes[i]; if (from.getAttribute(a.name) !== a.value) from.setAttribute(a.name, a.value) }
  if (from.tagName === 'TEXTAREA') return
  if (from.tagName === 'INPUT') { from.checked = to.hasAttribute('checked'); return }
  morphChildren(from, to)
}
function morphChildren(from, to) {
  var next = Array.prototype.slice.call(to.childNodes)
  var wanted = {}
  next.forEach(function (n) { var k = keyOf(n); if (k) wanted[k] = true })
  var keyed = {}
  Array.prototype.slice.call(from.childNodes).forEach(function (n) {
    var k = keyOf(n)
    if (k && !wanted[k]) from.removeChild(n)
    else if (k) keyed[k] = n
  })
  for (var i = 0; i < next.length; i++) {
    var n = next[i], k = keyOf(n), here = from.childNodes[i] || null, match = null
    if (k) { match = keyed[k] || null; if (match && match.nodeName !== n.nodeName) match = null }
    else if (here && !keyOf(here) && here.nodeName === n.nodeName) { match = here }
    if (match) {
      if (match !== here) from.insertBefore(match, here)
      if (match.nodeType === 1) morphNode(match, n)
      else if (match.nodeValue !== n.nodeValue) match.nodeValue = n.nodeValue
    } else {
      from.insertBefore(n, here)
    }
  }
  while (from.childNodes.length > next.length) from.removeChild(from.lastChild)
}
function paint(el, html) { var t = document.createElement(el.tagName); t.innerHTML = html; morphChildren(el, t) }

/* ---------- line diff: the longest common subsequence between the common head and tail ---------- */
function linesOf(text) { return text === '' || text == null ? [] : String(text).replace(/\r\n/g, '\n').replace(/\n$/, '').split('\n') }
function lineDiff(a, b) {
  var head = 0, tail = 0, ops = [], i, j
  while (head < a.length && head < b.length && a[head] === b[head]) head++
  while (tail < a.length - head && tail < b.length - head && a[a.length - 1 - tail] === b[b.length - 1 - tail]) tail++
  var n = a.length - head - tail, m = b.length - head - tail
  for (i = 0; i < head; i++) ops.push({ t: '=', a: i, b: i })
  if (n * m > 4000000) {
    for (i = 0; i < n; i++) ops.push({ t: '-', a: head + i, b: -1 })
    for (j = 0; j < m; j++) ops.push({ t: '+', a: -1, b: head + j })
  } else {
    var w = m + 1, tb = new Uint32Array((n + 1) * w)
    for (i = n - 1; i >= 0; i--) for (j = m - 1; j >= 0; j--) tb[i * w + j] = a[head + i] === b[head + j] ? tb[(i + 1) * w + j + 1] + 1 : Math.max(tb[(i + 1) * w + j], tb[i * w + j + 1])
    i = 0; j = 0
    while (i < n || j < m) {
      if (i < n && j < m && a[head + i] === b[head + j]) { ops.push({ t: '=', a: head + i, b: head + j }); i++; j++ }
      else if (j < m && (i === n || tb[i * w + j + 1] >= tb[(i + 1) * w + j])) { ops.push({ t: '+', a: -1, b: head + j }); j++ }
      else { ops.push({ t: '-', a: head + i, b: -1 }); i++ }
    }
  }
  for (var k = tail; k > 0; k--) ops.push({ t: '=', a: a.length - k, b: b.length - k })
  return ops
}
var models = {}
function modelOf(v, path) {
  var before = state.bases[path] || '', after = v.code.after[path]
  if (after == null) after = ''
  var key = v.key + '\n' + path, m = models[key]
  if (m && m.before === before && m.after === after) return m
  var a = linesOf(before), b = linesOf(after)
  m = models[key] = { before: before, after: after, a: a, b: b, ops: lineDiff(a, b), key: key }
  return m
}

/* ---------- code: Shiki with Islands Dark ---------- */
var EXT = { php: 'php', ts: 'typescript', tsx: 'tsx', js: 'javascript', mjs: 'javascript', cjs: 'javascript', jsx: 'jsx', py: 'python', rb: 'ruby', go: 'go', rs: 'rust', java: 'java', kt: 'kotlin', swift: 'swift', cs: 'csharp', c: 'c', h: 'c', cpp: 'cpp', sql: 'sql', yml: 'yaml', yaml: 'yaml', json: 'json', toml: 'toml', xml: 'xml', html: 'html', css: 'css', scss: 'scss', vue: 'vue', md: 'markdown', sh: 'bash', bash: 'bash', graphql: 'graphql', twig: 'twig' }
function langOf(path) {
  var name = String(path).toLowerCase().split('/').pop()
  if (/\.blade\.php$/.test(name)) return 'blade'
  if (name === 'dockerfile') return 'dockerfile'
  var ext = name.indexOf('.') >= 0 ? name.split('.').pop() : ''
  return EXT[ext] || 'text'
}
var shiki = { state: 'loading', hl: null, langs: null, loaded: {} }
var painted = {}
function tokenHTML(t) {
  var st = 'color:' + t.color
  if (t.fontStyle & 1) st += ';font-style:italic'
  if (t.fontStyle & 2) st += ';font-weight:600'
  return '<span style="' + st + '">' + esc(t.content) + '</span>'
}
function paintKey(path, text) { return path + '\n' + text.length + '\n' + text.slice(0, 64) + text.slice(-64) }
function highlightText(path, text) {
  var key = paintKey(path, text), lang = langOf(path)
  if (painted[key] !== undefined || shiki.state !== 'ready' || lang === 'text' || !shiki.langs[lang]) return Promise.resolve(false)
  var load = shiki.loaded[lang] || (shiki.loaded[lang] = shiki.hl.loadLanguage(shiki.langs[lang]))
  painted[key] = null
  return load.then(function () {
    painted[key] = shiki.hl.codeToTokensBase(text.replace(/\r\n/g, '\n').replace(/\n$/, ''), { lang: lang, theme: window.VARIANTS_THEME.name }).map(function (line) { return line.map(tokenHTML).join('') })
    return true
  }).catch(function () { painted[key] = null; return false })
}
function linesHTML(path, text, lines) { var p = painted[paintKey(path, text)]; return p ? p : lines.map(esc) }
function highlightCurrent() {
  var v = curVariant()
  if (!v) return
  var path = currentPath(v)
  if (!path) return
  var jobs = []
  if (v.code.status === 'ready') jobs.push(highlightText(path, state.bases[path] || ''), highlightText(path, v.code.after[path] || ''))
  if (v.sketch.status === 'ready' && v.sketch.files[path]) jobs.push(highlightText(path, v.sketch.files[path]))
  Promise.all(jobs).then(function (r) { if (r.some(Boolean)) render() })
}
window.addEventListener('variants:shiki', function () {
  var s = window.variantsShiki
  if (!s) { shiki.state = 'failed'; return }
  shiki.hl = s.highlighter; shiki.langs = s.languages; shiki.state = 'ready'
  highlightCurrent()
})

/* ---------- drawing ---------- */
function header() {
  var t = T(), cls = !online.hub ? ' off' : !online.session ? ' off' : '', label = !online.hub ? t.hubDown : !online.session ? t.offline : t.online
  return '<header class="hdr"><div class="in">' +
    '<div style="display:flex;align-items:center;gap:12px;flex:1 1 260px;min-width:0"><div class="logo">' + ICONS.logo + '</div><div style="min-width:0"><h1>' + esc(t.title) + '</h1>' +
    '<div style="font-size:12px;color:var(--muted)">Claude' + (state.project ? ' · <span class="mono">' + esc(state.project) + '</span>' : '') + (state.branch ? ' · ' + esc(t.branch) + ' <span class="mono">' + esc(state.branch) + '</span>' : '') + '</div></div></div>' +
    '<div class="pill' + cls + '"><span class="dot"></span>' + esc(label) + '</div></div></header>'
}
function taskCard() {
  var t = T(), k = state.task
  var steps = k.steps.length ? '<ol class="steps">' + k.steps.map(function (s, i) { return '<li' + (k.kind === 'bug' && i === k.steps.length - 1 ? ' class="last"' : '') + '><span class="n">' + (i + 1) + '</span><span>' + inline(s) + '</span></li>' }).join('') + '</ol>' : ''
  return '<section class="card task" aria-label="Task"><div style="display:flex;flex-wrap:wrap;align-items:center;gap:8px 10px"><span class="chip ' + k.kind + '"><span class="d"></span>' + esc(k.kind === 'bug' ? t.bug : t.feature) + '</span>' +
    (k.ref ? '<span class="ref">' + esc(k.ref) + '</span>' : '') + '</div><h2>' + esc(k.title) + '</h2><p>' + inline(k.summary) + '</p>' + steps + '</section>'
}
function variantCards() {
  var t = T(), cur = curVariant()
  var cards = state.variants.map(function (v) {
    var sel = S.mode === 'detail' && cur && v.key === cur.key, tt = totals(v)
    var nums = v.code.status === 'ready' ? '<span class="add">+' + tt.add + '</span><span class="del">−' + tt.del + '</span><span class="fnt">' + esc(t.files(v.files.length)) + '</span>' : '<span class="fnt">' + esc(t.files(v.files.length)) + ' · ' + esc(v.sketch.status === 'ready' ? t.sketchTag : t.noCode) + '</span>'
    return '<button type="button" class="vcard" data-key="v-' + esc(v.key) + '" data-act="pick" data-k="' + esc(v.key) + '" aria-pressed="' + sel + '">' +
      '<span style="display:flex;align-items:center;gap:8px;width:100%"><span class="key">' + esc(v.key) + '</span>' +
      (v.key === state.recommended ? '<span class="tag rec">' + esc(t.rec) + '</span>' : '') + (v.origin === 'combined' ? '<span class="tag built">' + esc(t.built) + '</span>' : '') +
      '<span style="flex:1 1 auto"></span>' + (state.applied === v.key ? '<span class="tag ok">' + ICONS.check + esc(t.applied) + '</span>' : state.selected === v.key ? '<span class="tag ok">' + ICONS.check + esc(t.chosen) + '</span>' : '') + '</span>' +
      '<span class="t">' + esc(v.title) + '</span><span class="s">' + inline(v.short) + '</span><span class="nums">' + nums + '</span></button>'
  }).join('')
  var waiting = state.busy && state.busy.what === 'session' && state.chat.length && state.chat[state.chat.length - 1].kind === 'another'
  var prep = waiting ? '<div class="prep" data-key="prep"><span style="display:flex;align-items:center;gap:8px"><span class="k">' + esc(nextKey()) + '</span><span style="font-size:12px;color:var(--claude);font-weight:600">' + esc(t.preparing) + '</span></span><span class="bar1" style="width:80%"></span><span class="bar2" style="width:95%"></span><span class="bar2" style="width:60%"></span></div>' : ''
  return '<div class="vgrid">' + cards + prep + '<button type="button" class="ghost" data-key="ghost" data-act="composer" data-c="alt">' + ICONS.plus + esc(t.askAlt) + '</button></div>'
}
function nextKey() { for (var c = 65; c <= 90; c++) { var k = String.fromCharCode(c); if (!variant(k)) return k } return 'V' + (state.variants.length + 1) }
function currentPath(v) {
  var paths = v.files.map(function (f) { return f.path })
  var p = S.files[v.key]
  return paths.indexOf(p) >= 0 ? p : paths[0]
}

function codeRows(v, path) {
  var t = T(), m = modelOf(v, path)
  var bh = linesHTML(path, m.before, m.a), ah = linesHTML(path, m.after, m.b)
  var ops = m.ops, full = S.view === 'full', CONTEXT = 3
  var show = ops.map(function () { return full })
  if (!full) ops.forEach(function (op, i) { if (op.t !== '=') for (var k = Math.max(0, i - CONTEXT); k <= Math.min(ops.length - 1, i + CONTEXT); k++) show[k] = true })
  var items = [], gap = 0
  ops.forEach(function (op, i) {
    if (!show[i]) { gap++; return }
    if (gap) { items.push({ skip: gap }); gap = 0 }
    items.push(op)
  })
  if (gap) items.push({ skip: gap })
  var ref = function (no) { return '<button type="button" class="no" data-act="ref" data-ref="' + esc(v.key + ' · ' + splitPath(path).name + ':' + no) + '" title="' + esc(t.refLine) + '">' + no + '</button>' }
  var skip = function (n, withLink) { return '<button type="button" class="skip" data-act="view" data-v="full">' + ICONS.fold + esc(t.hidden(n)) + (withLink ? '<span class="go">' + esc(t.showFull) + '</span>' : '') + '</button>' }
  if (S.layout === 'unified') {
    return '<div class="rows">' + items.map(function (it) {
      if (it.skip) return skip(it.skip, true)
      var cls = it.t === '+' ? ' a' : it.t === '-' ? ' d' : ''
      var html = it.t === '-' ? bh[it.a] : ah[it.b]
      return '<div class="row' + cls + '"><span class="no">' + (it.a >= 0 ? it.a + 1 : '') + '</span>' + (it.b >= 0 ? ref(it.b + 1) : '<span class="no"></span>') +
        '<span class="mk">' + (it.t === '+' ? '+' : it.t === '-' ? '−' : '') + '</span><span class="tx">' + (html || ' ') + '</span></div>'
    }).join('') + '</div>'
  }
  var left = [], right = [], j = 0
  while (j < items.length) {
    var it = items[j]
    if (it.skip) { left.push(skip(it.skip, false)); right.push('<button type="button" class="skip" data-act="view" data-v="full"><span class="go">' + esc(t.showFull) + '</span></button>'); j++; continue }
    if (it.t === '=') {
      left.push('<div class="row"><span class="no">' + (it.a + 1) + '</span><span class="mk"></span><span class="tx">' + (bh[it.a] || ' ') + '</span></div>')
      right.push('<div class="row">' + ref(it.b + 1) + '<span class="mk"></span><span class="tx">' + (ah[it.b] || ' ') + '</span></div>')
      j++; continue
    }
    var dels = [], adds = []
    while (j < items.length && !items[j].skip && items[j].t === '-') { dels.push(items[j]); j++ }
    while (j < items.length && !items[j].skip && items[j].t === '+') { adds.push(items[j]); j++ }
    for (var k = 0; k < Math.max(dels.length, adds.length); k++) {
      var d = dels[k], a = adds[k]
      left.push(d ? '<div class="row d"><span class="no">' + (d.a + 1) + '</span><span class="mk">−</span><span class="tx">' + (bh[d.a] || ' ') + '</span></div>' : '<div class="row f"></div>')
      right.push(a ? '<div class="row a">' + ref(a.b + 1) + '<span class="mk">+</span><span class="tx">' + (ah[a.b] || ' ') + '</span></div>' : '<div class="row f"></div>')
    }
  }
  return '<div class="split"><div><div class="rows">' + left.join('') + '</div></div><div><div class="rows">' + right.join('') + '</div></div></div>'
}
function showOf(v) {
  var want = S.show[v.key]
  if (want === 'code' && v.code.status !== 'none') return 'code'
  if (want === 'sketch' && v.sketch.status !== 'none') return 'sketch'
  return v.code.status !== 'none' ? 'code' : v.sketch.status !== 'none' ? 'sketch' : 'none'
}
function waitHTML(label) { return '<div class="wait"><span>' + esc(label) + '</span><span class="ln" style="width:70%"></span><span class="ln" style="width:90%"></span><span class="ln" style="width:55%"></span></div>' }
function sketchRows(v, path) {
  var text = v.sketch.files[path] || '', lines = linesOf(text), html = linesHTML(path, text, lines)
  return '<div class="rows sk">' + lines.map(function (l, i) { return '<div class="row"><span class="no">' + (i + 1) + '</span><span class="mk"></span><span class="tx">' + (html[i] || ' ') + '</span></div>' }).join('') + '</div>'
}
function codeBlock(v) {
  var t = T(), path = currentPath(v)
  if (!path) return ''
  var sp = splitPath(path), c = v.code, sk = v.sketch, cnt = c.counts[path] || null, show = showOf(v)
  var which = '<div class="iseg" role="group"><button type="button" data-act="show" data-v="sketch" data-k="' + esc(v.key) + '" aria-pressed="' + (show === 'sketch') + '">' + esc(t.sketchBtn) + '</button><button type="button" data-act="show" data-v="code" data-k="' + esc(v.key) + '" aria-pressed="' + (show === 'code') + '">' + esc(t.codeBtn) + '</button></div>'
  var codeSegs = show === 'code' && c.status === 'ready'
    ? '<div class="iseg" role="group"><button type="button" data-act="view" data-v="diff" aria-pressed="' + (S.view === 'diff') + '">' + esc(t.diff) + '</button><button type="button" data-act="view" data-v="full" aria-pressed="' + (S.view === 'full') + '">' + esc(t.full) + '</button></div>' +
      '<div class="iseg" role="group"><button type="button" data-act="layout" data-v="unified" aria-pressed="' + (S.layout === 'unified') + '">' + ICONS.uni + esc(t.unified) + '</button><button type="button" data-act="layout" data-v="split" aria-pressed="' + (S.layout === 'split') + '">' + ICONS.spl + esc(t.split) + '</button></div>'
    : ''
  var top = '<div class="top">' + ICONS.file + '<span class="path"><span style="color:#7A7E85">' + esc(sp.dir) + '</span><span style="color:#DFE1E5;font-weight:500">' + esc(sp.name) + '</span>' +
    (show === 'code' && cnt ? '  <span style="color:#6AAB73">+' + cnt.add + '</span> <span style="color:#F0787D">−' + cnt.del + '</span>' : '') + '</span>' + which + codeSegs + '</div>'
  var body, foot = t.refHint
  if (show === 'none') {
    body = '<div class="pick"><span>' + esc(t.pickDetail) + '</span><span class="btns"><button type="button" class="dbtn" data-act="show" data-v="sketch" data-k="' + esc(v.key) + '">' + esc(t.sketchBtn) + '</button><button type="button" class="dbtn pri" data-act="show" data-v="code" data-k="' + esc(v.key) + '">' + ICONS.code + esc(t.codeBtn) + '</button></span></div>'
    foot = ''
  } else if (show === 'sketch') {
    foot = t.sketchNote
    body = sk.status === 'ready' ? '<div class="scroll" data-key="sk-' + esc(v.key + path) + '">' + sketchRows(v, path) + '</div>'
      : sk.status === 'error' ? '<div class="err"><span>' + esc(t.sketchError) + ': ' + esc(sk.error) + '</span><button type="button" class="btn" data-act="show" data-v="sketch" data-k="' + esc(v.key) + '">' + ICONS.again + esc(t.retry) + '</button></div>'
      : waitHTML(t.sketchWait)
  } else if (c.status === 'ready') {
    body = (S.layout === 'split' ? '<div class="sides"><div>' + esc(t.before) + '</div><div>' + esc(t.after) + ' · ' + esc(v.key) + '</div></div>' : '') + '<div class="scroll" data-key="scroll-' + esc(v.key + path + S.view + S.layout) + '">' + codeRows(v, path) + '</div>'
  } else if (c.status === 'error') {
    body = '<div class="err"><span>' + esc(t.codeError) + ': ' + esc(c.error) + '</span><button type="button" class="btn" data-act="regen" data-k="' + esc(v.key) + '">' + ICONS.again + esc(t.regen) + '</button></div>'
  } else {
    body = waitHTML(c.status === 'queued' ? t.codeQueued : c.via === 'session' ? t.codeWaitSession : t.codeWait)
  }
  return '<section class="code" aria-label="Code">' + top + body + '<div class="foot"><span>' + esc(foot) + '</span><span style="flex:1 1 auto"></span><span>' + esc(langOf(path).toUpperCase()) + ' · UTF-8 · LF</span></div></section>'
}
function applyBlock(v) {
  var t = T()
  var drifted = v.files.filter(function (f) { return state.drift.indexOf(f.path) >= 0 }).map(function (f) { return f.path })
  if (drifted.length) return '<div class="banner warn">' + ICONS.warn + '<div class="grow">' + esc(t.drift(drifted.join(', '))) + '</div><button type="button" class="btn" data-act="regen" data-k="' + esc(v.key) + '">' + ICONS.again + esc(t.regen) + '</button></div>'
  if (state.applied === v.key) {
    var r = state.testRun && state.testRun.key === v.key ? state.testRun : null
    return '<div class="banner ok">' + ICONS.okc + '<div class="grow"><b>' + esc(t.appliedText(v.key)) + '</b>' + (r ? ' ' + esc(t.tests(r)) : '') + '</div>' + (r && r.url ? '<a class="btn" href="' + esc(r.url) + '" target="_top">' + esc(t.openTests) + '</a>' : '') + '</div>'
  }
  if (state.selected !== v.key || state.applied) return ''
  var ready = v.code.status === 'ready'
  if (v.code.status === 'none' || v.code.status === 'error') {
    return '<div class="banner ok">' + ICONS.okc + '<div class="grow">' + esc(t.chosenNoCode(v.key)) + '</div><button type="button" class="btn flat" data-act="unchoose">' + esc(t.unchoose) + '</button>' +
      '<button type="button" class="btn pri" data-act="show" data-v="code" data-k="' + esc(v.key) + '">' + ICONS.code + esc(t.getCode) + '</button></div>'
  }
  var tests = state.hasTests && v.tests.length ? '<label class="chk"><input type="checkbox" data-act="runTests"' + (S.runTests ? ' checked' : '') + '>' + esc(t.runTests) + '</label>' : ''
  return '<div class="banner ok">' + ICONS.okc + '<div class="grow">' + esc(t.chosenText(v.key, state.branch)) + '</div>' + tests +
    '<button type="button" class="btn flat" data-act="unchoose">' + esc(t.unchoose) + '</button>' +
    '<button type="button" class="btn pri" data-act="apply" data-k="' + esc(v.key) + '"' + (ready ? '' : ' disabled') + '>' + esc(ready ? t.apply : t.waitCode) + '</button></div>'
}
function detail() {
  var t = T(), v = curVariant()
  if (!v) return ''
  var tt = totals(v), path = currentPath(v)
  var badges = v.files.map(function (f) {
    var sp = splitPath(f.path), cnt = v.code.counts[f.path]
    return '<button type="button" class="fb" data-key="fb-' + esc(f.path) + '" data-act="file" data-p="' + esc(f.path) + '" title="' + esc(f.path) + '" aria-pressed="' + (f.path === path) + '"><span class="st ' + f.status + '">' + f.status + '</span><span><span class="fnt">' + esc(sp.dir) + '</span>' + esc(sp.name) + '</span>' +
      (cnt ? '<span class="add">+' + cnt.add + '</span><span class="del">−' + cnt.del + '</span>' : '') + '</button>'
  }).join('')
  var meta = v.origin === 'combined' ? Object.keys(v.from).map(function (p) { return '<span class="meta">' + esc(splitPath(p).name) + ' <b>' + esc(v.from[p]) + '</b></span>' }).join('') : ''
  var chooseBtn = state.selected === v.key || state.applied === v.key ? '' : '<button type="button" class="btn big pri" data-act="choose" data-k="' + esc(v.key) + '"' + (state.applied ? ' disabled' : '') + '>' + ICONS.ok + esc(t.choose(v.key)) + '</button>'
  return '<article class="detail" data-key="detail">' +
    '<div class="body">' +
      '<div style="display:flex;flex-wrap:wrap;align-items:flex-start;gap:12px 16px"><span class="bigkey">' + esc(v.key) + '</span><div style="flex:1 1 300px;min-width:0;display:flex;flex-direction:column;gap:8px"><h3>' + esc(v.title) + '</h3>' + (meta ? '<div style="display:flex;flex-wrap:wrap;gap:6px">' + meta + '</div>' : '') + '</div>' +
      '<button type="button" class="btn" data-act="composer" data-c="ask">' + ICONS.ask + esc(t.askAbout) + '</button></div>' +
      applyBlock(v) +
      '<section style="display:flex;flex-direction:column;gap:8px"><div class="lbl">' + esc(t.essence) + '</div><p class="essence">' + inline(v.essence) + '</p></section>' +
      '<div class="pc"><section class="pros"><div class="lbl" style="color:var(--ok)">' + esc(t.pros) + '</div><ul>' + v.pros.map(function (p) { return '<li><span class="m add">+</span><span>' + inline(p) + '</span></li>' }).join('') + '</ul></section>' +
      '<section class="cons"><div class="lbl" style="color:var(--hi)">' + esc(t.cons) + '</div><ul>' + v.cons.map(function (p) { return '<li><span class="m del">−</span><span>' + inline(p) + '</span></li>' }).join('') + '</ul></section></div>' +
      '<section style="display:flex;flex-direction:column;gap:10px"><div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap"><div class="lbl">' + esc(t.touched) + '</div>' +
      '<div class="mono" style="font-size:12px;color:var(--muted)">' + esc(t.files(v.files.length)) + (v.code.status === 'ready' ? ' · <span class="add">+' + tt.add + '</span> <span class="del">−' + tt.del + '</span>' : '') + '</div></div><div class="fbadges">' + badges + '</div>' +
      (v.files.some(function (f) { return f.what }) ? '<ul class="whats">' + v.files.filter(function (f) { return f.what }).map(function (f) { return '<li><span class="fn" title="' + esc(f.path) + '">' + esc(splitPath(f.path).name) + '</span><span>' + inline(f.what) + '</span></li>' }).join('') + '</ul>' : '') + '</section>' +
      codeBlock(v) +
    '</div>' +
    '<div class="actions">' + chooseBtn +
      '<button type="button" class="btn big" data-act="mode" data-v="combine">' + ICONS.merge + esc(t.combineWith) + '</button>' +
      '<button type="button" class="btn big" data-act="composer" data-c="alt">' + ICONS.again + esc(t.other) + '</button>' +
      '<button type="button" class="btn big flat" data-act="composer" data-c="own">' + ICONS.code + esc(t.own) + '</button>' +
    '</div></article>'
}

function allPaths() { var out = []; state.variants.forEach(function (v) { v.files.forEach(function (f) { if (out.indexOf(f.path) < 0) out.push(f.path) }) }); return out }
function holders(path) { return state.variants.filter(function (v) { return v.files.some(function (f) { return f.path === path }) }).map(function (v) { return v.key }) }
function picks() {
  var cur = curVariant(), out = {}
  allPaths().forEach(function (p) {
    if (S.picks[p] !== undefined) { out[p] = S.picks[p]; return }
    var hs = holders(p)
    out[p] = cur && hs.indexOf(cur.key) >= 0 ? cur.key : hs.indexOf(state.recommended) >= 0 ? state.recommended : ''
  })
  return out
}
function stem(path) { return splitPath(path).name.replace(/\..*$/, '') }
function combineView() {
  var t = T(), pk = picks(), paths = allPaths()
  var rows = paths.map(function (p) {
    var sp = splitPath(p), hs = holders(p)
    var opts = state.variants.map(function (v) {
      var has = hs.indexOf(v.key) >= 0
      return '<button type="button" data-act="pickFile" data-p="' + esc(p) + '" data-k="' + esc(v.key) + '" aria-pressed="' + (pk[p] === v.key) + '" aria-label="' + esc(t.fromAria(v.key)) + '"' + (has ? '' : ' disabled') + '>' + esc(v.key) + '</button>'
    }).join('') + '<button type="button" data-act="pickFile" data-p="' + esc(p) + '" data-k="" aria-pressed="' + (pk[p] === '') + '" aria-label="' + esc(t.noneAria) + '">' + esc(t.none) + '</button>'
    return '<div class="crow" data-key="cr-' + esc(p) + '"><div style="min-width:0;display:flex;flex-direction:column;gap:2px"><span class="p"><span class="fnt">' + esc(sp.dir) + '</span>' + esc(sp.name) + '</span><span style="font-size:12px;color:var(--muted)">' + esc(t.onlyIn(hs)) + '</span></div><div class="opts" role="group">' + opts + '</div></div>'
  }).join('')
  var used = {}, warnings = [], waiting = [], add = 0, del = 0, count = 0
  paths.forEach(function (p) { if (pk[p]) { used[pk[p]] = true; count++ } })
  Object.keys(used).forEach(function (k) {
    var v = variant(k)
    if (v.code.status !== 'ready') { waiting.push(k); return }
    v.files.forEach(function (f) {
      if (pk[f.path] !== k) return
      if (v.code.counts[f.path]) { add += v.code.counts[f.path].add; del += v.code.counts[f.path].del }
      var text = v.code.after[f.path] || ''
      v.files.forEach(function (q) { if (q.status === 'A' && pk[q.path] !== k && q.path !== f.path && text.indexOf(stem(q.path)) >= 0) warnings.push(t.seam(splitPath(f.path).name, k, splitPath(q.path).name)) })
    })
  })
  var notes = warnings.map(function (w, i) { return '<div class="note warn" data-key="w' + i + '">' + ICONS.warn + '<span>' + esc(w) + '</span></div>' }).join('') +
    (waiting.length ? '<div class="note warn" data-key="wait">' + ICONS.warn + '<span>' + esc(S.pendingBuild ? t.building : t.seamLater) + '</span></div>' : !warnings.length && count ? '<div class="note ok" data-key="okn">' + ICONS.okc + '<span><b>' + esc(t.compat) + '</b> ' + esc(t.compatHint) + '</span></div>' : '')
  var can = count > 0 && !S.pendingBuild
  return '<article class="detail" data-key="combine"><div class="body" style="gap:18px"><div style="display:flex;flex-direction:column;gap:6px"><h3>' + esc(t.combTitle) + '</h3><p style="margin:0;font-size:14px;color:var(--muted);max-width:70ch">' + esc(t.combText) + '</p></div>' +
    '<div class="ctable"><div class="in"><div class="crow head lbl"><span>' + esc(t.file) + '</span><span>' + esc(t.from) + '</span></div>' + rows + '</div></div>' + notes +
    '<div style="display:flex;flex-wrap:wrap;gap:8px 16px;align-items:center;font-size:13px;color:var(--muted)"><span>' + esc(t.result) + ': <b style="color:var(--text);font-weight:600">' + esc(nextKey()) + ' · ' + esc(t.files(count)) + '</b></span><span class="mono" style="font-size:12px"><span class="add">+' + add + '</span> <span class="del">−' + del + '</span></span></div>' +
    '<label style="display:flex;flex-direction:column;gap:6px"><span class="lbl">' + esc(t.combNote) + '</span><textarea class="in" id="combNote" rows="2" placeholder="' + esc(t.combPh) + '">' + esc(S.combNote) + '</textarea></label>' +
    '<label class="chk"><input type="checkbox" data-act="checkSeams"' + (S.checkSeams ? ' checked' : '') + '>' + esc(t.checkSeams) + '</label></div>' +
    '<div class="actions"><button type="button" class="btn big pri" data-act="build"' + (can ? '' : ' disabled') + '>' + ICONS.merge + esc(waiting.length ? t.buildGet(nextKey()) : t.build(nextKey())) + '</button><button type="button" class="btn big flat" data-act="mode" data-v="detail">' + esc(t.cancel) + '</button></div></article>'
}

function chatPanel() {
  var t = T()
  var msgs = state.chat.map(function (m) {
    var isC = m.by === 'claude', cls = m.kind === 'note' ? ' c n' : isC ? ' c' : ''
    var via = m.via ? ' · ' + esc(t.via[m.via] || m.via) : ''
    var refs = m.refs && m.refs.length ? '<div class="rchips">' + m.refs.map(function (r) { return '<span class="rchip">' + esc(r) + '</span>' }).join('') + '</div>' : ''
    var act = isC && m.via === 'quick' && m.question ? '<button type="button" class="mact" data-act="deep" data-id="' + m.id + '">' + esc(t.askDeep) + '</button>' : ''
    return '<div class="msg' + cls + '" data-key="m' + m.id + '"><span class="av">' + (isC ? 'C' : esc(t.you.slice(0, 2))) + '</span><div class="col"><div class="who"><b>' + esc(isC ? t.claude : t.you) + '</b> · ' + esc(hhmm(m.at)) + via + (m.variant ? ' · ' + esc(m.variant) : '') + '</div>' +
      refs + (m.text ? '<div class="bub">' + rich(m.text) + '</div>' : '') + (m.code ? '<pre class="blk">' + esc(m.code) + '</pre>' : '') + act + '</div></div>'
  }).join('')
  var busy = state.busy ? '<div class="typing" data-key="typing"><span class="av" style="width:28px;height:28px;border-radius:50%;display:grid;place-items:center;font-size:12px;font-weight:650;background:var(--claude-soft);color:var(--claude)">C</span><span class="t"><span class="dots"><i></i><i></i><i></i></span>' + esc(state.busy.what === 'session' ? t.looking : t.thinking) + '</span></div>' : ''
  var queued = state.queued ? '<div class="note warn" data-key="queued">' + ICONS.warn + '<span>' + esc(t.queued(state.queued)) + '</span></div>' : ''
  var c = S.composer
  var refChips = S.refs.length ? '<div class="rchips">' + S.refs.map(function (r, i) { return '<span class="rchip" data-key="rc' + esc(r) + '">' + esc(r) + '<button type="button" data-act="unref" data-i="' + i + '" aria-label="' + esc(t.remove + ' ' + r) + '">' + ICONS.x + '</button></span>' }).join('') + '</div>' : ''
  var alts = c === 'alt' ? '<div style="display:flex;flex-direction:column;gap:6px"><span style="font-size:12px;color:var(--muted)">' + esc(t.constraints) + '</span><div style="display:flex;flex-wrap:wrap;gap:6px">' + t.alts.map(function (a) { return '<button type="button" class="ach" data-act="alt" data-a="' + esc(a) + '" aria-pressed="' + (S.alts.indexOf(a) >= 0) + '">' + esc(a) + '</button>' }).join('') + '</div></div>' : ''
  var own = c === 'own' ? '<textarea class="codein" id="ownCode" rows="5" spellcheck="false" placeholder="' + esc(t.ownPh) + '">' + esc(S.ownCode) + '</textarea>' : ''
  return '<aside class="card chat" aria-label="' + esc(t.chat) + '"><div class="head"><span class="av0">' + ICONS.star + '</span><div style="flex:1;min-width:0"><div style="font-size:14px;font-weight:600">' + esc(t.chat) + '</div><div style="font-size:12px;color:var(--muted)">' + esc(t.chatSub) + '</div></div><span class="cnt">' + state.chat.length + '</span></div>' +
    '<div class="msgs" id="msgs">' + msgs + busy + queued + '</div>' +
    '<div class="composer"><div class="seg grow" role="group">' + ['ask', 'own', 'alt'].map(function (k) { return '<button type="button" data-act="composer" data-c="' + k + '" aria-pressed="' + (c === k) + '">' + esc(t[k === 'ask' ? 'cAsk' : k === 'own' ? 'cOwn' : 'cAlt']) + '</button>' }).join('') + '</div>' +
    refChips + alts + '<textarea class="in" id="draft" rows="3" style="resize:none;min-height:64px;border-radius:12px" placeholder="' + esc(t.ph[c]) + '" aria-label="' + esc(t.ph[c]) + '">' + esc(S.draft) + '</textarea>' + own +
    '<div style="display:flex;align-items:center;gap:8px"><span style="flex:1;font-size:12px;color:var(--faint)">' + esc(t.hint[c]) + '</span><button type="button" class="btn pri" data-act="send">' + esc(t.send[c]) + ICONS.send + '</button></div></div></aside>'
}

function render() {
  var t = T(), app = $('app')
  document.title = t.title
  var html = header()
  if (!state.task) {
    html += '<main><section class="card empty"><h2>' + esc(t.emptyTitle) + '</h2><p>' + esc(t.emptyText) + '</p></section></main>'
  } else {
    var cur = curVariant()
    html += '<main>' + taskCard() + '<div class="cols"><div class="left">' +
      '<div class="bar"><div style="flex:1 1 260px;min-width:0"><div class="lbl">' + esc(t.variants) + '</div><div style="font-size:13px;color:var(--muted)">' + esc(t.count(state.variants.length)) + (state.recommended ? ' · ' + esc(t.recommends(state.recommended)) : '') + '</div></div>' +
      '<div class="seg" role="group"><button type="button" data-act="mode" data-v="detail" aria-pressed="' + (S.mode === 'detail') + '">' + esc(t.detail) + '</button><button type="button" data-act="mode" data-v="combine" aria-pressed="' + (S.mode === 'combine') + '">' + esc(t.combine) + '</button></div></div>' +
      variantCards() + (S.mode === 'combine' ? combineView() : cur ? detail() : '') + '</div>' + chatPanel() + '</div></main>'
  }
  paint(app, html)
  var box = $('msgs')
  if (box && state.chat.length !== S.lastChat) { S.lastChat = state.chat.length; box.scrollTop = box.scrollHeight }
  highlightCurrent()
}

/* ---------- presses ---------- */
function focusDraft() { var d = $('draft'); if (d) d.focus() }
document.addEventListener('click', function (ev) {
  var el = ev.target.closest('[data-act]')
  if (!el || el.disabled) return
  var act = el.getAttribute('data-act'), k = el.getAttribute('data-k'), v = el.getAttribute('data-v')
  switch (act) {
    case 'pick': S.cur = k; S.mode = 'detail'; break
    case 'mode': S.mode = v; break
    case 'file': S.files[S.cur] = el.getAttribute('data-p'); break
    case 'view': S.view = v; break
    case 'layout': S.layout = v; break
    case 'ref': var r = el.getAttribute('data-ref'); if (S.refs.indexOf(r) < 0) S.refs.push(r); if (S.composer === 'alt') S.composer = 'ask'; render(); focusDraft(); return
    case 'unref': S.refs.splice(Number(el.getAttribute('data-i')), 1); break
    case 'composer': S.composer = el.getAttribute('data-c'); render(); focusDraft(); return
    case 'alt': var a = el.getAttribute('data-a'), i = S.alts.indexOf(a); if (i >= 0) S.alts.splice(i, 1); else S.alts.push(a); break
    case 'choose': send({ type: 'choose', key: k }); break
    case 'unchoose': send({ type: 'unchoose' }); break
    case 'apply': send({ type: 'apply', key: k, runTests: S.runTests }); el.disabled = true; return
    case 'regen': S.show[k] = 'code'; send({ type: 'regen', key: k }); break
    case 'show':
      S.show[k] = v
      var vv = variant(k)
      if (vv && v === 'sketch' && (vv.sketch.status === 'none' || vv.sketch.status === 'error')) send({ type: 'sketch', key: k })
      if (vv && v === 'code' && (vv.code.status === 'none' || vv.code.status === 'error')) send({ type: 'code', key: k })
      break
    case 'pickFile': S.picks[el.getAttribute('data-p')] = k; break
    case 'runTests': S.runTests = el.checked; return
    case 'checkSeams': S.checkSeams = el.checked; return
    case 'build':
      var pk = picks(), need = {}
      Object.keys(pk).forEach(function (p) { var src = pk[p] && variant(pk[p]); if (src && src.code.status !== 'ready') need[src.key] = src })
      S.pendingBuild = { picks: pk, note: S.combNote, checkSeams: S.checkSeams }
      Object.keys(need).forEach(function (key) { if (need[key].code.status === 'none' || need[key].code.status === 'error') send({ type: 'code', key: key }) })
      tryBuild()
      break
    case 'deep':
      var m = state.chat.filter(function (x) { return String(x.id) === el.getAttribute('data-id') })[0]
      if (m) send({ type: 'ask', text: m.question, refs: [], key: m.variant, deep: true })
      return
    case 'send': submit(); return
  }
  render()
})
document.addEventListener('input', function (ev) {
  var id = ev.target.id
  if (id === 'draft') S.draft = ev.target.value
  else if (id === 'ownCode') S.ownCode = ev.target.value
  else if (id === 'combNote') S.combNote = ev.target.value
})
document.addEventListener('keydown', function (ev) {
  if (ev.target.id === 'draft' && ev.key === 'Enter' && (ev.metaKey || ev.ctrlKey)) { ev.preventDefault(); submit() }
})
function clearField(id) { var el = $(id); if (el) el.value = '' }
function submit() {
  var c = S.composer, text = S.draft.trim(), cur = curVariant(), key = cur ? cur.key : ''
  if (c === 'ask' && text) send({ type: 'ask', text: text, refs: S.refs.slice(), key: key, deep: false })
  else if (c === 'own' && (text || S.ownCode.trim())) send({ type: 'own', text: text, code: S.ownCode, refs: S.refs.slice(), key: key })
  else if (c === 'alt' && (text || S.alts.length)) send({ type: 'another', constraints: S.alts.slice(), note: text })
  else return
  S.draft = ''; S.ownCode = ''; S.refs = []; S.alts = []
  clearField('draft'); clearField('ownCode')
  render()
}

/** A build pressed before every source's code was in goes once it is. */
function tryBuild() {
  var b = S.pendingBuild
  if (!b) return
  var keys = Object.keys(b.picks).map(function (p) { return b.picks[p] }).filter(Boolean)
  if (keys.some(function (k) { var v = variant(k); return !v || v.code.status === 'error' })) { S.pendingBuild = null; return }
  if (keys.some(function (k) { return variant(k).code.status !== 'ready' })) return
  S.pendingBuild = null
  send({ type: 'combine', picks: b.picks, note: b.note, checkSeams: b.checkSeams })
  S.picks = {}; S.combNote = ''; S.mode = 'detail'; S.cur = nextKey()
}
hub.onState(function (s) {
  if (!s) return
  var before = state.variants.length
  state = s
  if (s.variants.length > before && before > 0) { S.cur = s.variants[s.variants.length - 1].key; S.mode = 'detail' }
  tryBuild()
  render()
})
hub.onOnline(function (o) { online = o; render() })
hub.onLang(function () { document.documentElement.lang = hub.lang; render() })
document.documentElement.lang = hub.lang
render()
})()
</script>
</body>
</html>`

export const PAGE = SOURCE.replace('__SHIKI__', SHIKI_VERSION).replace('__THEME__', () => JSON.stringify(ISLANDS_DARK))
