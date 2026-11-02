---
name: implement-story
description: Take a user story from user-story/ through the full workflow, which analyzes it, reads the Figma design when one is linked, implements the API, verifies it with QA and reports the result. Use when the user asks to implement, build or deliver a story, or names a file in user-story/.
---

Run the workflow in [user-story/README.md](../../../user-story/README.md) for the story in `$ARGUMENTS`, in order, and keep to its **Stop** points. If no story is named, list the stories in `user-story/` and ask which one.

Figma skills come from the Figma plugin if it is installed. Otherwise read them with `ReadMcpResourceTool` from the `claude.ai Figma` server at `skill://figma/<skill>/SKILL.md`. Call `create_session` before the first read of a Figma file.
