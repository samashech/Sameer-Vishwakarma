import re

with open('src/components/NavBar.jsx', 'r') as f:
    code = f.read()

# 1. Update imports
code = code.replace("import { Menu, X, Mail, Github, Linkedin } from 'lucide-react';", "import { Menu, X, Mail } from 'lucide-react';\nimport { GithubIcon, LinkedinIcon } from './Icons';")

# 2. Update components
code = code.replace("<Github", "<GithubIcon")
code = code.replace("<Linkedin", "<LinkedinIcon")

with open('src/components/NavBar.jsx', 'w') as f:
    f.write(code)

