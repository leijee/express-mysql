import os
import codecs
import xml.dom.minidom as Dom 

def walkdir(dir_name, includes_node):
  for cur, _dirs, files in os.walk(dir_name):
    path = os.path.relpath(cur, dir_name)
    if path == '.':
      path = ''
    for f in files:
      ext = os.path.splitext(f)[1]
      if ext == '.grd':
        continue;
      if not ext.strip():
        ext = '.BINDATA'
      file = os.path.join(path, f).replace('\\', '/')
      print file
      include_node = doc.createElement('include')
      include_node.setAttribute('name', os.path.join(path, f).upper().replace('.','_').replace('/','_').replace('\\','_'))
      include_node.setAttribute('file', os.path.join(path, f).replace('\\','/'))
      include_node.setAttribute('type', ext[1:])
      includes_node.appendChild(include_node)

from optparse import OptionParser

parser = OptionParser(description="")
parser.add_option('--output', dest='output', help='Output GRD file name, default: web_resources.grd', default='web_resources.grd')
parser.add_option('--pak', dest='pak', help='PAK file name, default: web_resources.pak', default='web_resources.pak')
parser.add_option('--path', dest='path', help='The path we should traverse.')
(options, args) = parser.parse_args()

if __name__ == '__main__': 
  if not options.path or not options.path.strip():
    raise Exception('Path is none.')

  doc = Dom.Document() 
  root_node = doc.createElement('grit') 
  root_node.setAttribute('latest_public_release', '0') 
  root_node.setAttribute('current_release', '1') 
  doc.appendChild(root_node) 

  outputs_node = doc.createElement('outputs')
  output_json_node = doc.createElement('output')
  output_json_node.setAttribute('filename', 'web_resources.json')
  output_json_node.setAttribute('type', 'rc_header')
  output_json_emit_node = doc.createElement('emit')
  output_json_emit_node.setAttribute('emit_type', 'prepend')
  output_json_node.appendChild(output_json_emit_node)
  output_pak_node = doc.createElement('output')
  output_pak_node.setAttribute('filename', options.pak)
  output_pak_node.setAttribute('type', 'data_package')
  outputs_node.appendChild(output_json_node);
  outputs_node.appendChild(output_pak_node);

  release_node = doc.createElement('release')
  release_node.setAttribute('seq', '1')
  includes_node = doc.createElement('includes')

  walkdir(options.path, includes_node);

  release_node.appendChild(includes_node)

  root_node.appendChild(outputs_node)
  root_node.appendChild(release_node)
  
  txt = doc.toprettyxml(indent = '  ', newl = '\n', encoding = 'utf-8')
  f = codecs.open(options.output, 'w', 'utf-8')
  f.write(txt)
  f.close()