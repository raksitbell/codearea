# CodeArea external utilities

Resource-heavy utilities run independently from the root application:

- [`executor`](executor/README.md): the minimal Piston implementation is vendored into CodeArea because its former remote cannot be published to.
- [`chatbot`](chatbot/README.md): `https://github.com/raksitbell/codearea_chatbot.git`, cleaned to a native Ollama-only utility on its `development` branch.

Initialize the chatbot with `git submodule update --init --recursive`. The consolidated Next.js application uses the vendored Piston utility through `PISTON_URL` and calls the chatbot utility's native Ollama API through `OLLAMA_URL`; neither utility is placed in the root Compose stack.
