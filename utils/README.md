# CodeArea external utilities

These independently versioned Git submodules restore the repositories previously nested below the backend:

- [`executor`](executor/README.md): `https://github.com/raksitbell/piston.git`, pinned to the previously used Piston revision.
- [`chatbot`](chatbot/README.md): `https://github.com/raksitbell/codearea_chatbot.git`, cleaned to a native Ollama-only utility on its `development` branch.

Initialize them with `git submodule update --init --recursive`. The consolidated Next.js application uses Piston through `PISTON_URL` and calls the chatbot utility's native Ollama API directly through `OLLAMA_URL`; neither utility is placed in the root Compose stack.
