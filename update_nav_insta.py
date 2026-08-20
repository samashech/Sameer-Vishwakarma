import re

with open('src/components/NavBar.jsx', 'r') as f:
    code = f.read()

# 1. Update imports
code = code.replace("import { GithubIcon, LinkedinIcon } from './Icons';", "import { GithubIcon, InstagramIcon } from './Icons';")

# 2. Update desktop nav link
old_link_desktop = '<a href="https://www.linkedin.com/in/sameer-vishwakarma-676571416/" target="_blank" rel="noreferrer" aria-label="LinkedIn"><LinkedinIcon size={20} /></a>'
new_link_desktop = '<a href="https://www.instagram.com/samashech?igsh=MW81bXhvN3BsYjJxMQ==" target="_blank" rel="noreferrer" aria-label="Instagram"><InstagramIcon size={20} /></a>'
code = code.replace(old_link_desktop, new_link_desktop)

# 3. Update mobile nav link
old_link_mobile = '<a href="https://www.linkedin.com/in/sameer-vishwakarma-676571416/"><LinkedinIcon size={24} /></a>'
new_link_mobile = '<a href="https://www.instagram.com/samashech?igsh=MW81bXhvN3BsYjJxMQ=="><InstagramIcon size={24} /></a>'
code = code.replace(old_link_mobile, new_link_mobile)

with open('src/components/NavBar.jsx', 'w') as f:
    f.write(code)

