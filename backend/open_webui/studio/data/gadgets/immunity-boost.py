"""
title: Quality Improvement
author: Gyro Governance
version: 1.0.0
license: MIT
description: Revise supplied content using the extension structure and behavior criteria, without diagnostic scoring.
"""
# Copyright (c) 2025 Gyro Governance. See bundled AI Inspector MIT license.
from pydantic import BaseModel, Field
from open_webui.studio.gadgets import run_gadget


class Tools:
    class Valves(BaseModel):
        MODEL: str = Field(default="", description="Optional inference model ID. Empty uses the current chat model.")

    def __init__(self):
        self.valves = self.Valves()

    async def improve_content(self, text: str, instructions: str = "", __request__=None,
                        __user__=None, __model__=None, __metadata__=None,
                        __event_emitter__=None) -> str:
        """Revise supplied content using the extension structure and behavior criteria, without diagnostic scoring.
        :param text: Complete source text to process, retaining section or page labels when available.
        :param instructions: Optional scope, audience, or revision constraints supplied by the person requesting the task.
        """
        return await run_gadget("immunity-boost", text, instructions, self.valves.MODEL,
                                __request__, __user__, __model__, __metadata__, __event_emitter__)
