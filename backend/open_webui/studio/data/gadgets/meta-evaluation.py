"""
title: Meta-Evaluation
author: Gyro Governance
version: 1.0.0
license: MIT
description: Run the three-pass Human Mark workflow on a supplied evaluation or governance document.
"""
# Copyright (c) 2025 Gyro Governance. See bundled AI Inspector MIT license.
from pydantic import BaseModel, Field
from open_webui.studio.gadgets import run_gadget


class Tools:
    class Valves(BaseModel):
        MODEL: str = Field(default="", description="Optional inference model ID. Empty uses the current chat model.")

    def __init__(self):
        self.valves = self.Valves()

    async def review_governance_document(self, text: str, instructions: str = "", __request__=None,
                        __user__=None, __model__=None, __metadata__=None,
                        __event_emitter__=None) -> str:
        """Run the three-pass Human Mark workflow on a supplied evaluation or governance document.
        :param text: Complete source text to process, retaining section or page labels when available.
        :param instructions: Optional scope, audience, or revision constraints supplied by the person requesting the task.
        """
        return await run_gadget("meta-evaluation", text, instructions, self.valves.MODEL,
                                __request__, __user__, __model__, __metadata__, __event_emitter__)
