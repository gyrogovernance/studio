"""
title: Policy Auditing
author: Gyro Governance
version: 1.0.0
license: MIT
description: Extract exact claims, evidence and their relationships from supplied policy or document text.
"""
# Copyright (c) 2025 Gyro Governance. See bundled AI Inspector MIT license.
from pydantic import BaseModel, Field
from open_webui.studio.gadgets import run_gadget


class Tools:
    class Valves(BaseModel):
        MODEL: str = Field(default="", description="Optional inference model ID. Empty uses the current chat model.")

    def __init__(self):
        self.valves = self.Valves()

    async def extract_claims_and_evidence(self, text: str, instructions: str = "", __request__=None,
                        __user__=None, __model__=None, __metadata__=None,
                        __event_emitter__=None) -> str:
        """Extract exact claims, evidence and their relationships from supplied policy or document text.
        :param text: Complete source text to process, retaining section or page labels when available.
        :param instructions: Optional scope, audience, or revision constraints supplied by the person requesting the task.
        """
        return await run_gadget("policy-audit", text, instructions, self.valves.MODEL,
                                __request__, __user__, __model__, __metadata__, __event_emitter__)
