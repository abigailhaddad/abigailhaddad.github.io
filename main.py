import pandas as pd
import os


# Replace this with your own DataFrame
df = pd.read_excel("selected_cols.xlsx")

# Save the table as an HTML file
with open("./gh-pages/table.html", "w") as f:
    f.write(df.to_html(index=False))

def git_commit_push():
    os.system('git add .')
    os.system('git commit -m "Update table"')
    os.system('git push origin main')  # Replace 'main' with your default branch name if different

# Call the function after updating the table
git_commit_push()
