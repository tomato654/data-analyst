import os

env = os.environ
print(env)

os.environ["OPENAI_API_KEY"] = "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"
os.environ["GOOGLE_KEY"] = "AIzaSyBu5On6bmRSQYYVCszlvEDmU9dIhZfM3b8"
os.environ["GOOGLE_CX"] = "46438696edec64cd5"
print("google cx",os.environ["GOOGLE_CX"])
print("google key",os.environ["GOOGLE_KEY"])
