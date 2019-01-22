	window.UIHelper = class UIHelper {
	    static isIOS()
	    {
	        return navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad');
	    }
	
	    static isWebKit2()
	    {
	        return window.testRunner.isWebKit2;
	    }
	
	    static tapAt(x, y)
	    {
	        console.assert(this.isIOS());
	
	        if (!this.isWebKit2()) {
	            eventSender.addTouchPoint(x, y);
	            eventSender.touchStart();
	            eventSender.releaseTouchPoint(0);
	            eventSender.touchEnd();
	            return Promise.resolve();
	        }
	
	        return new Promise((resolve) => {
	            testRunner.runUIScript(`
	                uiController.singleTapAtPoint(${x}, ${y}, function() {
	                    uiController.uiScriptComplete();
	                });`, resolve);
	        });
	    }
	
	    static doubleTapAt(x, y)
	    {
	        console.assert(this.isIOS());
	
	        if (!this.isWebKit2()) {
	            eventSender.addTouchPoint(x, y);
	            eventSender.touchStart();
	            eventSender.releaseTouchPoint(0);
	            eventSender.touchEnd();
	            eventSender.addTouchPoint(x, y);
	            eventSender.touchStart();
	            eventSender.releaseTouchPoint(0);
	            eventSender.touchEnd();
	            return Promise.resolve();
	        }
	
	        return new Promise((resolve) => {
	            testRunner.runUIScript(`
	                uiController.doubleTapAtPoint(${x}, ${y}, function() {
	                    uiController.uiScriptComplete();
	                });`, resolve);
	        });
	    }
	
	    static zoomByDoubleTappingAt(x, y)
	    {
	        console.assert(this.isIOS());
	
	        if (!this.isWebKit2()) {
	            eventSender.addTouchPoint(x, y);
	            eventSender.touchStart();
	            eventSender.releaseTouchPoint(0);
	            eventSender.touchEnd();
	            eventSender.addTouchPoint(x, y);
	            eventSender.touchStart();
	            eventSender.releaseTouchPoint(0);
	            eventSender.touchEnd();
	            return Promise.resolve();
	        }
	
	        return new Promise((resolve) => {
	            testRunner.runUIScript(`
	                uiController.didEndZoomingCallback = () => {
	                    uiController.didEndZoomingCallback = null;
	                    uiController.uiScriptComplete(uiController.zoomScale);
	                };
	                uiController.doubleTapAtPoint(${x}, ${y}, () => {});`, resolve);
	        });
	    }
	
	    static activateAt(x, y)
	    {
	        if (!this.isWebKit2() || !this.isIOS()) {
	            eventSender.mouseMoveTo(x, y);
	            eventSender.mouseDown();
	            eventSender.mouseUp();
	            return Promise.resolve();
	        }
	
	        return new Promise((resolve) => {
	            testRunner.runUIScript(`
	                uiController.singleTapAtPoint(${x}, ${y}, function() {
	                    uiController.uiScriptComplete();
	                });`, resolve);
	        });
	    }
	
	    static activateElement(element)
	    {
	        const x = element.offsetLeft + element.offsetWidth / 2;
	        const y = element.offsetTop + element.offsetHeight / 2;
	        return UIHelper.activateAt(x, y);
	    }
	
	    static keyDown(key, modifiers=[])
	    {
	        if (!this.isWebKit2() || !this.isIOS()) {
	            eventSender.keyDown(key, modifiers);
	            return Promise.resolve();
	        }
	
	        return new Promise((resolve) => {
	            testRunner.runUIScript(`uiController.keyDown("${key}", ${JSON.stringify(modifiers)});`, resolve);
	        });
	    }
	
	    static toggleCapsLock()
	    {
	        return new Promise((resolve) => {
	            testRunner.runUIScript(`uiController.toggleCapsLock(() => uiController.uiScriptComplete());`, resolve);
	        });
	    }
	
	    static ensurePresentationUpdate()
	    {
	        if (!this.isWebKit2()) {
	            testRunner.display();
	            return Promise.resolve();
	        }
	
	        return new Promise(resolve => {
	            testRunner.runUIScript(`
	                uiController.doAfterPresentationUpdate(function() {
	                    uiController.uiScriptComplete();
	                });`, resolve);
	        });
	    }
	
	    static ensureVisibleContentRectUpdate()
	    {
	        if (!this.isWebKit2())
	            return Promise.resolve();
	
	        return new Promise(resolve => {
	            const visibleContentRectUpdateScript = "uiController.doAfterVisibleContentRectUpdate(() => uiController.uiScriptComplete())";
	            testRunner.runUIScript(visibleContentRectUpdateScript, resolve);
	        });
	    }
	
	    static activateAndWaitForInputSessionAt(x, y)
	    {
	        if (!this.isWebKit2() || !this.isIOS())
	            return this.activateAt(x, y);
	
	        return new Promise(resolve => {
	            testRunner.runUIScript(`
	                (function() {
	                    uiController.didShowKeyboardCallback = function() {
	                        uiController.uiScriptComplete();
	                    };
	                    uiController.singleTapAtPoint(${x}, ${y}, function() { });
	                })()`, resolve);
	        });
	    }
	
	    static activateFormControl(element)
	    {
	        if (!this.isWebKit2() || !this.isIOS())
	            return this.activateElement(element);
	
	        const x = element.offsetLeft + element.offsetWidth / 2;
	        const y = element.offsetTop + element.offsetHeight / 2;
	
	        return new Promise(resolve => {
	            testRunner.runUIScript(`
	                (function() {
	                    uiController.didStartFormControlInteractionCallback = function() {
	                        uiController.uiScriptComplete();
	                    };
	                    uiController.singleTapAtPoint(${x}, ${y}, function() { });
	                })()`, resolve);
	        });
	    }
	
	    static waitForKeyboardToHide()
	    {
	        if (!this.isWebKit2() || !this.isIOS())
	            return Promise.resolve();
	
	        return new Promise(resolve => {
	            testRunner.runUIScript(`
	                (function() {
	                    if (uiController.isShowingKeyboard)
	                        uiController.didHideKeyboardCallback = () => uiController.uiScriptComplete();
	                    else
	                        uiController.uiScriptComplete();
	                })()`, resolve);
	        });
	    }
	
	    static getUICaretRect()
	    {
	        if (!this.isWebKit2() || !this.isIOS())
	            return Promise.resolve();
	
	        return new Promise(resolve => {
	            testRunner.runUIScript(`(function() {
	                uiController.doAfterNextStablePresentationUpdate(function() {
	                    uiController.uiScriptComplete(JSON.stringify(uiController.textSelectionCaretRect));
	                });
	            })()`, jsonString => {
	                resolve(JSON.parse(jsonString));
	            });
	        });
	    }
	
	    static getUISelectionRects()
	    {
	        if (!this.isWebKit2() || !this.isIOS())
	            return Promise.resolve();
	
	        return new Promise(resolve => {
	            testRunner.runUIScript(`(function() {
	                uiController.doAfterNextStablePresentationUpdate(function() {
	                    uiController.uiScriptComplete(JSON.stringify(uiController.textSelectionRangeRects));
	                });
	            })()`, jsonString => {
	                resolve(JSON.parse(jsonString));
	            });
	        });
	    }
	
	    static getUICaretViewRect()
	    {
	        if (!this.isWebKit2() || !this.isIOS())
	            return Promise.resolve();
	
	        return new Promise(resolve => {
	            testRunner.runUIScript(`(function() {
	                uiController.doAfterNextStablePresentationUpdate(function() {
	                    uiController.uiScriptComplete(JSON.stringify(uiController.selectionCaretViewRect));
	                });
	            })()`, jsonString => {
	                resolve(JSON.parse(jsonString));
	            });
	        });
	    }
	
	    static getUISelectionViewRects()
	    {
	        if (!this.isWebKit2() || !this.isIOS())
	            return Promise.resolve();
	
	        return new Promise(resolve => {
	            testRunner.runUIScript(`(function() {
	                uiController.doAfterNextStablePresentationUpdate(function() {
	                    uiController.uiScriptComplete(JSON.stringify(uiController.selectionRangeViewRects));
	                });
	            })()`, jsonString => {
	                resolve(JSON.parse(jsonString));
	            });
	        });
	    }
	
	    static getSelectionStartGrabberViewRect()
	    {
	        if (!this.isWebKit2() || !this.isIOS())
	            return Promise.resolve();
	
	        return new Promise(resolve => {
	            testRunner.runUIScript(`(function() {
	                uiController.doAfterNextStablePresentationUpdate(function() {
	                    uiController.uiScriptComplete(JSON.stringify(uiController.selectionStartGrabberViewRect));
	                });
	            })()`, jsonString => {
	                resolve(JSON.parse(jsonString));
	            });
	        });
	    }
	
	    static getSelectionEndGrabberViewRect()
	    {
	        if (!this.isWebKit2() || !this.isIOS())
	            return Promise.resolve();
	
	        return new Promise(resolve => {
	            testRunner.runUIScript(`(function() {
	                uiController.doAfterNextStablePresentationUpdate(function() {
	                    uiController.uiScriptComplete(JSON.stringify(uiController.selectionEndGrabberViewRect));
	                });
	            })()`, jsonString => {
	                resolve(JSON.parse(jsonString));
	            });
	        });
	    }
	
	    static replaceTextAtRange(text, location, length) {
	        return new Promise(resolve => {
	            testRunner.runUIScript(`(() => {
	                uiController.replaceTextAtRange("${text}", ${location}, ${length});
	                uiController.uiScriptComplete();
	            })()`, resolve);
	        });
	    }
	
	    static wait(promise)
	    {
	        testRunner.waitUntilDone();
	        if (window.finishJSTest)
	            window.jsTestIsAsync = true;
	
	        let finish = () => {
	            if (window.finishJSTest)
	                finishJSTest();
	            else
	                testRunner.notifyDone();
	        }
	
	        return promise.then(finish, finish);
	    }
	
	    static withUserGesture(callback)
	    {
	        internals.withUserGesture(callback);
	    }
	
	    static selectFormAccessoryPickerRow(rowIndex)
	    {
	        const selectRowScript = `(() => uiController.selectFormAccessoryPickerRow(${rowIndex}))()`;
	        return new Promise(resolve => testRunner.runUIScript(selectRowScript, resolve));
	    }
	
	    static selectFormPopoverTitle()
	    {
	        return new Promise(resolve => {
	            testRunner.runUIScript(`(() => {
	                uiController.uiScriptComplete(uiController.selectFormPopoverTitle);
	            })()`, resolve);
	        });
	    }
	
	    static enterText(text)
	    {
	        const escapedText = text.replace(/`/g, "\\`");
	        const enterTextScript = `(() => uiController.enterText(\`${escapedText}\`))()`;
	        return new Promise(resolve => testRunner.runUIScript(enterTextScript, resolve));
	    }
	
	    static setTimePickerValue(hours, minutes)
	    {
	        const setValueScript = `(() => uiController.setTimePickerValue(${hours}, ${minutes}))()`;
	        return new Promise(resolve => testRunner.runUIScript(setValueScript, resolve));
	    }
	
	    static setShareSheetCompletesImmediatelyWithResolution(resolved)
	    {
	        const resolveShareSheet = `(() => uiController.setShareSheetCompletesImmediatelyWithResolution(${resolved}))()`;
	        return new Promise(resolve => testRunner.runUIScript(resolveShareSheet, resolve));
	    }
	
	    static textContentType()
	    {
	        return new Promise(resolve => {
	            testRunner.runUIScript(`(() => {
	                uiController.uiScriptComplete(uiController.textContentType);
	            })()`, resolve);
	        });
	    }
	
	    static formInputLabel()
	    {
	        return new Promise(resolve => {
	            testRunner.runUIScript(`(() => {
	                uiController.uiScriptComplete(uiController.formInputLabel);
	            })()`, resolve);
	        });
	    }
	
	    static isShowingDataListSuggestions()
	    {
	        return new Promise(resolve => {
	            testRunner.runUIScript(`(() => {
	                uiController.uiScriptComplete(uiController.isShowingDataListSuggestions);
	            })()`, result => resolve(result === "true" ? true : false));
	        });
	    }
	
	    static zoomScale()
	    {
	        return new Promise(resolve => {
	            testRunner.runUIScript(`(() => {
	                uiController.uiScriptComplete(uiController.zoomScale);
	            })()`, scaleAsString => resolve(parseFloat(scaleAsString)));
	        });
	    }
	
	    static zoomToScale(scale)
	    {
	        const uiScript = `uiController.zoomToScale(${scale}, () => uiController.uiScriptComplete(uiController.zoomScale))`;
	        return new Promise(resolve => testRunner.runUIScript(uiScript, resolve));
	    }
	
	    static typeCharacter(characterString)
	    {
	        if (!this.isWebKit2() || !this.isIOS()) {
	            eventSender.keyDown(characterString);
	            return;
	        }
	
	        const escapedString = characterString.replace(/\\/g, "\\\\").replace(/`/g, "\\`");
	        const uiScript = `uiController.typeCharacterUsingHardwareKeyboard(\`${escapedString}\`, () => uiController.uiScriptComplete())`;
	        return new Promise(resolve => testRunner.runUIScript(uiScript, resolve));
	    }
	
	    static applyAutocorrection(newText, oldText)
	    {
	        if (!this.isWebKit2())
	            return;
	
	        const [escapedNewText, escapedOldText] = [newText.replace(/`/g, "\\`"), oldText.replace(/`/g, "\\`")];
	        const uiScript = `uiController.applyAutocorrection(\`${escapedNewText}\`, \`${escapedOldText}\`, () => uiController.uiScriptComplete())`;
	        return new Promise(resolve => testRunner.runUIScript(uiScript, resolve));
	    }
	
	    static inputViewBounds()
	    {
	        if (!this.isWebKit2() || !this.isIOS())
	            return Promise.resolve();
	
	        return new Promise(resolve => {
	            testRunner.runUIScript(`(() => {
	                uiController.uiScriptComplete(JSON.stringify(uiController.inputViewBounds));
	            })()`, jsonString => {
	                resolve(JSON.parse(jsonString));
	            });
	        });
	    }
	
	    static calendarType()
	    {
	        if (!this.isWebKit2())
	            return Promise.resolve();
	
	        return new Promise(resolve => {
	            testRunner.runUIScript(`(() => {
	                uiController.doAfterNextStablePresentationUpdate(() => {
	                    uiController.uiScriptComplete(JSON.stringify(uiController.calendarType));
	                })
	            })()`, jsonString => {
	                resolve(JSON.parse(jsonString));
	            });
	        });
	    }
	
	    static setDefaultCalendarType(calendarIdentifier)
	    {
	        if (!this.isWebKit2())
	            return Promise.resolve();
	
	        return new Promise(resolve => testRunner.runUIScript(`uiController.setDefaultCalendarType('${calendarIdentifier}')`, resolve));
	
	    }
	
	    static setViewScale(scale)
	    {
	        if (!this.isWebKit2())
	            return Promise.resolve();
	
	        return new Promise(resolve => testRunner.runUIScript(`uiController.setViewScale(${scale})`, resolve));
	    }
	
	    static resignFirstResponder()
	    {
	        if (!this.isWebKit2())
	            return Promise.resolve();
	
	        return new Promise(resolve => testRunner.runUIScript(`uiController.resignFirstResponder()`, resolve));
	    }
	
	    static minimumZoomScale()
	    {
	        if (!this.isWebKit2())
	            return Promise.resolve();
	
	        return new Promise(resolve => {
	            testRunner.runUIScript(`(() => {
	                uiController.uiScriptComplete(uiController.minimumZoomScale);
	            })()`, scaleAsString => resolve(parseFloat(scaleAsString)))
	        });
	    }
	
	    static drawSquareInEditableImage()
	    {
	        if (!this.isWebKit2())
	            return Promise.resolve();
	
	        return new Promise(resolve => testRunner.runUIScript(`uiController.drawSquareInEditableImage()`, resolve));
	    }
	
	    static stylusTapAt(x, y)
	    {
	        if (!this.isWebKit2())
	            return Promise.resolve();
	
	        return new Promise((resolve) => {
	            testRunner.runUIScript(`
	                uiController.stylusTapAtPoint(${x}, ${y}, 2, 1, 0.5, function() {
	                    uiController.uiScriptComplete();
	                });`, resolve);
	        });
	    }
	
	    static numberOfStrokesInEditableImage()
	    {
	        if (!this.isWebKit2())
	            return Promise.resolve();
	
	        return new Promise(resolve => {
	            testRunner.runUIScript(`(() => {
	                uiController.uiScriptComplete(uiController.numberOfStrokesInEditableImage);
	            })()`, numberAsString => resolve(parseInt(numberAsString, 10)))
	        });
	    }
	
	    static attachmentInfo(attachmentIdentifier)
	    {
	        if (!this.isWebKit2())
	            return Promise.resolve();
	
	        return new Promise(resolve => {
	            testRunner.runUIScript(`(() => {
	                uiController.uiScriptComplete(JSON.stringify(uiController.attachmentInfo('${attachmentIdentifier}')));
	            })()`, jsonString => {
	                resolve(JSON.parse(jsonString));
	            })
	        });
	    }
	
	    static setMinimumEffectiveWidth(effectiveWidth)
	    {
	        if (!this.isWebKit2())
	            return Promise.resolve();
	
	        return new Promise(resolve => testRunner.runUIScript(`uiController.setMinimumEffectiveWidth(${effectiveWidth})`, resolve));
	    }
	
	    static setKeyboardInputModeIdentifier(identifier)
	    {
	        if (!this.isWebKit2())
	            return Promise.resolve();
	
	        const escapedIdentifier = identifier.replace(/`/g, "\\`");
	        return new Promise(resolve => testRunner.runUIScript(`uiController.setKeyboardInputModeIdentifier(\`${escapedIdentifier}\`)`, resolve));
	    }
	
	    static contentOffset()
	    {
	        if (!this.isIOS())
	            return Promise.resolve();
	
	        const uiScript = "JSON.stringify([uiController.contentOffsetX, uiController.contentOffsetY])";
	        return new Promise(resolve => testRunner.runUIScript(uiScript, result => {
	            const [offsetX, offsetY] = JSON.parse(result)
	            resolve({ x: offsetX, y: offsetY });
	        }));
	    }
	}
