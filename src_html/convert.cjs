const { parse } = require('node-html-parser');
const fs = require('fs');

const VOID = new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);
const ATTR = { class:'className', for:'htmlFor', tabindex:'tabIndex', colspan:'colSpan', rowspan:'rowSpan',
  maxlength:'maxLength', minlength:'minLength', readonly:'readOnly', autocomplete:'autoComplete',
  autofocus:'autoFocus', spellcheck:'spellCheck', contenteditable:'contentEditable', crossorigin:'crossOrigin',
  srcset:'srcSet', usemap:'useMap', novalidate:'noValidate', enctype:'encType', datetime:'dateTime',
  frameborder:'frameBorder', allowfullscreen:'allowFullScreen', accesskey:'accessKey', inputmode:'inputMode' };
const BOOL = new Set(['checked','selected','disabled','readOnly','required','autoFocus','multiple','noValidate','allowFullScreen','hidden','open']);

const ENT = { '&nbsp;':' ','&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'"','&#39;':"'",'&apos;':"'",
  '&times;':'×','&rarr;':'→','&larr;':'←','&mdash;':'—','&ndash;':'–',
  '&bull;':'•','&hellip;':'…','&deg;':'°','&copy;':'©','&reg;':'®','&trade;':'™' };
const decode = s => s.replace(/&[a-zA-Z#0-9]+;/g, m => ENT[m] !== undefined ? ENT[m]
  : /^&#\d+;$/.test(m) ? String.fromCodePoint(+m.slice(2,-1)) : m);

const styleToObj = css => {
  const out = [];
  for (const part of css.split(';')) {
    const i = part.indexOf(':'); if (i < 0) continue;
    let prop = part.slice(0,i).trim(), val = part.slice(i+1).trim();
    if (!prop || !val) continue;
    const key = prop.startsWith('--') ? `'${prop}'` : prop.replace(/-([a-z])/g,(_,c)=>c.toUpperCase());
    out.push(`${key}: ${JSON.stringify(val)}`);
  }
  return out.length ? `{{ ${out.join(', ')} }}` : null;
};

const esc = t => decode(t).replace(/([{}])/g,'{\'$1\'}');

// Elements that should get a scroll-reveal hook
function markReveal(node, depth) {
  const cn = node.getAttribute('class') || '';
  const tag = node.rawTagName;
  if (tag === 'section') { node.setAttribute('data-reveal-group',''); return; }
  // cards / panels / grid items inside sections
  if (/\brounded-(xl|lg|full)\b/.test(cn) && /\b(bg-|border|shadow)/.test(cn) && depth <= 7) {
    node.setAttribute('data-reveal',''); return;
  }
  if (/^(h1|h2|h3)$/.test(tag)) node.setAttribute('data-reveal','');
}

function toJSX(node, indent, depth) {
  const pad = '  '.repeat(indent);
  if (node.nodeType === 3) {
    const t = node.rawText;
    if (!t.trim()) return '';
    const clean = esc(t).replace(/\s+/g,' ');
    return pad + '{' + JSON.stringify(clean) + '}\n';
  }
  if (node.nodeType === 8) {
    const c = (node.rawText||'').replace(/^<!--|-->$/g,'').trim().replace(/\*\//g,'*\/');
    return c ? pad + '{/* ' + c + ' */}\n' : '';
  }
  const tag = node.rawTagName;
  if (!tag) return (node.childNodes||[]).map(c=>toJSX(c,indent,depth)).join('');
  if (tag === 'script' || tag === 'style') return '';

  markReveal(node, depth);

  const attrs = [];
  for (const [rawK, rawV] of Object.entries(node.attributes || {})) {
    let k = ATTR[rawK.toLowerCase()] || rawK;
    if (/^on[a-z]+$/i.test(k)) continue;
    if (k === 'style') { const o = styleToObj(rawV); if (o) attrs.push(`style=${o}`); continue; }
    if (k.includes('-') && !k.startsWith('data-') && !k.startsWith('aria-')) {
      k = k.replace(/-([a-z])/g,(_,c)=>c.toUpperCase());
    }
    if (rawV === '' && BOOL.has(k)) { attrs.push(k); continue; }
    attrs.push(`${k}=${JSON.stringify(decode(rawV))}`);
  }
  const attrStr = attrs.length ? ' ' + attrs.join(' ') : '';

  if (VOID.has(tag)) return `${pad}<${tag}${attrStr} />\n`;

  const kids = (node.childNodes||[]).map(c=>toJSX(c,indent+1,depth+1)).join('');
  if (!kids) return `${pad}<${tag}${attrStr}></${tag}>\n`;
  return `${pad}<${tag}${attrStr}>\n${kids}${pad}</${tag}>\n`;
}

const [,, file, outFile, compName] = process.argv;
const root = parse(fs.readFileSync(file,'utf8'), { comment: true, blockTextElements:{script:false,style:false} });
const body = root.querySelector('body');
body.querySelectorAll('header').forEach(n=>n.remove());
body.querySelectorAll('footer').forEach(n=>n.remove());
const main = body.querySelector('main') || body;
const jsx = (main.childNodes||[]).map(c=>toJSX(c,3,0)).join('');
const mainCls = main.rawTagName === 'main' ? (main.getAttribute('class')||'') : '';
fs.writeFileSync(outFile,
`import Reveal from "../components/Reveal";

export default function ${compName}() {
  return (
    <Reveal.Page className=${JSON.stringify(mainCls)}>
${jsx}    </Reveal.Page>
  );
}
`);
console.log(outFile, '->', jsx.split('\n').length, 'lines');
