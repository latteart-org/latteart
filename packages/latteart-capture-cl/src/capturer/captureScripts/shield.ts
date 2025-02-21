/**
 * Copyright 2025 NTT Corporation.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { ExtendedDocument } from "./types";

export const shieldScripts = {
  initGuard,
  attachShield,
  detachShield,
};

function initGuard({
  shieldStyle,
}: {
  shieldStyle: {
    position: string;
    zIndex: string;
    width: string;
    height: string;
    opacity: string;
    backgroundColor: string;
  };
}) {
  const extendedDocument: ExtendedDocument = document;
  const __LATTEART_INIT_GUARD__ = "__latteart_init_guard__";
  const initGuard = extendedDocument.getElementById(__LATTEART_INIT_GUARD__);
  if (
    extendedDocument.readyState !== "complete" &&
    !extendedDocument.__capturingIsPaused &&
    !initGuard
  ) {
    const shield = extendedDocument.createElement("div");
    shield.id = __LATTEART_INIT_GUARD__;
    shield.style.position = shieldStyle.position;
    shield.style.zIndex = shieldStyle.zIndex;
    shield.style.width = shieldStyle.width;
    shield.style.height = shieldStyle.height;
    shield.style.opacity = shieldStyle.opacity;
    shield.style.backgroundColor = shieldStyle.backgroundColor;
    extendedDocument.body.insertAdjacentElement("afterbegin", shield);
  }

  if (document.readyState === "complete" && initGuard && initGuard.parentNode) {
    initGuard.parentNode.removeChild(initGuard);
  }
  return true;
}

function attachShield({ shieldId }: { shieldId: string }) {
  const target = document.getElementById(shieldId);

  if (target) {
    return;
  }

  const shield = document.createElement("div");
  shield.id = shieldId;
  shield.style.position = "absolute";
  shield.style.zIndex = "2147483647";
  shield.style.width = "100%";
  shield.style.height = `${document.body.clientHeight}px`;
  shield.style.opacity = "0.6";
  shield.style.backgroundColor = "#333";

  document.body.insertAdjacentElement("afterbegin", shield);
}

function detachShield({ shieldId }: { shieldId: string }) {
  const extendedDocument: ExtendedDocument = document;
  const target = extendedDocument.getElementById(shieldId);
  if (!target || !target.parentNode) {
    return;
  }

  target.parentNode.removeChild(target);
}
