import re

with open('src/components/NavBar.jsx', 'r') as f:
    code = f.read()

# 1. Update imports
code = code.replace("Menu, X, Mail, Code, Briefcase", "Menu, X, Mail, Github, Linkedin")

# 2. Update Logo
code = code.replace(">SV.</a>", ">Samashech</a>")

# 3. Update GitHub Icons
code = code.replace("<Code size={20} />", "<Github size={20} />")
code = code.replace("<Code size={24} />", "<Github size={24} />")

# 4. Update LinkedIn Icons
code = code.replace("<Briefcase size={20} />", "<Linkedin size={20} />")
code = code.replace("<Briefcase size={24} />", "<Linkedin size={24} />")

# 5. Update LinkedIn URL
code = code.replace("https://linkedin.com/in/sameer-vishwakarma", "https://www.linkedin.com/in/sameer-vishwakarma-676571416/")

with open('src/components/NavBar.jsx', 'w') as f:
    f.write(code)

