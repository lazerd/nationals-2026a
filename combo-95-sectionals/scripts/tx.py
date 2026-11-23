import re,sys,html
def text(s):
    t=re.sub(r'<script.*?</script>|<style.*?</style>','',s,flags=re.S)
    t=re.sub(r'<br\s*/?>|</tr>|</p>|</div>|</li>','\n',t); t=re.sub(r'</td>|</th>',' | ',t); t=re.sub(r'<[^>]+>',' ',t); t=html.unescape(t)
    t=re.sub(r'[ \t\xa0]+',' ',t); t=re.sub(r'\n[\s|]*\n+','\n',t); return t
def links(s): return re.findall(r'href=["\']?([^"\' >]+)["\']?[^>]*>(.*?)</a>',s,flags=re.S)
if __name__=='__main__':
    s=open(sys.argv[1],encoding='latin-1').read()
    mode=sys.argv[2] if len(sys.argv)>2 else 't'
    if 't' in mode: print(text(s)[:int(sys.argv[3]) if len(sys.argv)>3 else 6000])
    if 'l' in mode:
        for h,a in links(s): print(h, '::', re.sub(r'<[^>]+>|\s+',' ',a).strip()[:80])
