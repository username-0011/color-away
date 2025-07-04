
        const baseColorPicker = document.getElementById('baseColorPicker');
        const baseColorValueDisplay = document.getElementById('baseColorValue');
        const complementaryPaletteDiv = document.getElementById('complementaryPalette');
        const analogousPaletteDiv = document.getElementById('analogousPalette');
        const triadicPaletteDiv = document.getElementById('triadicPalette');
        const monochromaticPaletteDiv = document.getElementById('monochromaticPalette');
        const demoButton = document.getElementById('demoButton');
        const demoTextBlock = document.getElementById('demoTextBlock');
        const toastNotification = document.getElementById('toastNotification');

        const colorStripBanner = document.getElementById('colorStripBanner');
        const baseColorSegment = document.getElementById('baseColorSegment');
        const complementaryColorSegment = document.getElementById('complementaryColorSegment');
        const analogousColorSegment = document.getElementById('analogousColorSegment');
        const monochromaticColorSegment = document.getElementById('monochromaticColorSegment');

        const buttonLabel = document.getElementById('buttonLabel');
        const textBlockLabel = document.getElementById('textBlockLabel');

        // New UI Elements
        const demoInput = document.getElementById('demoInput');
        const demoToggle = document.getElementById('demoToggle');
        const radioOptions = document.querySelectorAll('input[name="demoRadio"]');

        // Modal Elements
        const loginButton = document.getElementById('loginButton');
        const aboutButton = document.getElementById('aboutButton');
        const supportButton = document.getElementById('supportButton');
        const loginModal = document.getElementById('loginModal');
        const aboutModal = document.getElementById('aboutModal');
        const supportModal = document.getElementById('supportModal');
        const loginForm = document.getElementById('loginForm');

        // Palette Management Elements
        const savePaletteBtn = document.getElementById('savePaletteBtn');
        const loadPaletteBtn = document.getElementById('loadPaletteBtn');
        const exportPaletteBtn = document.getElementById('exportPaletteBtn');
        const exportModal = document.getElementById('exportModal');
        const exportTextArea = exportModal.querySelector('#exportTextArea');
        const copyExportBtn = exportModal.querySelector('.copy-button');

        // Color Converter Elements
        const hexInput = document.getElementById('hexInput');
        const rgbInputR = document.getElementById('rgbInputR');
        const rgbInputG = document.getElementById('rgbInputG');
        const rgbInputB = document.getElementById('rgbInputB');
        const hslInputH = document.getElementById('hslInputH');
        const hslInputS = document.getElementById('hslInputS');
        const hslInputL = document.getElementById('hslInputL');

        const converterPreviewHex = document.getElementById('converterPreviewHex');
        const converterPreviewRgb = document.getElementById('converterPreviewRgb');
        const converterPreviewHsl = document.getElementById('converterPreviewHsl');

        const hexErrorMessage = document.getElementById('hexErrorMessage');
        const rgbErrorMessage = document.getElementById('rgbErrorMessage');
        const hslErrorMessage = document.getElementById('hslErrorMessage');


        // Pricing section buttons for dynamic color update
        const pricingSignupButtons = document.querySelectorAll('.pricing-card .signup-button');

        // Global variable to store the current generated palettes
        let currentPalettes = {};

        /* --- Color Conversion Helper Functions --- */

        /**
         * Converts HSL (Hue, Saturation, Lightness) to RGB.
         * HSL values are in [0, 360) for H, [0, 100] for S and L.
         * RGB values are in [0, 255].
         * @param {number} h Hue (0-360)
         * @param {number} s Saturation (0-100)
         * @param {number} l Lightness (0-100)
         * @returns {object} {r, g, b}
         */
        function hslToRgb(h, s, l) {
            s /= 100; // Convert S from [0, 100] to [0, 1]
            l /= 100; // Convert L from [0, 100] to [0, 1]

            let c = (1 - Math.abs(2 * l - 1)) * s;
            let x = c * (1 - Math.abs((h / 60) % 2 - 1));
            let m = l - c / 2;
            let r = 0, g = 0, b = 0;

            if (0 <= h && h < 60) {
                r = c; g = x; b = 0;
            } else if (60 <= h && h < 120) {
                r = x; g = c; b = 0;
            } else if (120 <= h && h < 180) {
                r = 0; g = c; b = x;
            } else if (180 <= h && h < 240) {
                r = 0; g = x; b = c;
            } else if (240 <= h && h < 300) {
                r = x; g = 0; b = c;
            } else if (300 <= h && h < 360) {
                r = c; g = 0; b = x;
            }

            r = Math.round((r + m) * 255);
            g = Math.round((g + m) * 255);
            b = Math.round((b + m) * 255);

            return { r, g, b };
        }

        /**
         * Converts RGB (Red, Green, Blue) to HSL.
         * RGB values are in [0, 255].
         * HSL values are in [0, 360) for H, [0, 100] for S and L.
         * @param {number} r Red (0-255)
         * @param {number} g Green (0-255)
         * @param {number} b Blue (0-255)
         * @returns {object} {h, s, l}
         */
        function rgbToHsl(r, g, b) {
            r /= 255;
            g /= 255;
            b /= 255;

            let max = Math.max(r, g, b), min = Math.min(r, g, b);
            let h, s, l = (max + min) / 2;

            if (max === min) {
                h = s = 0; // achromatic
            } else {
                let d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch (max) {
                    case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                    case g: h = (b - r) / d + 2; break;
                    case b: h = (r - g) / d + 4; break;
                }
                h /= 6;
            }

            return {
                h: h * 360,
                s: s * 100, // Convert S to [0, 100]
                l: l * 100  // Convert L to [0, 100]
            };
        }

        /**
         * Converts a Hex color string to RGB.
         * @param {string} hex Hex color string (e.g., "#RRGGBB" or "RRGGBB")
         * @returns {object|null} {r, g, b} or null if invalid.
         */
        function hexToRgb(hex) {
            const hexValue = hex.startsWith('#') ? hex.slice(1) : hex;
            if (!/^[0-9A-Fa-f]{6}$/.test(hexValue)) return null;
            const r = parseInt(hexValue.slice(0, 2), 16);
            const g = parseInt(hexValue.slice(2, 4), 16);
            const b = parseInt(hexValue.slice(4, 6), 16);
            return { r, g, b };
        }

        /**
         * Converts a Hex color string to HSL.
         * @param {string} hex Hex color string (e.g., "#RRGGBB")
         * @returns {object|null} {h, s, l} or null if invalid.
         */
        function hexToHsl(hex) {
            const rgb = hexToRgb(hex);
            if (!rgb) return null;
            return rgbToHsl(rgb.r, rgb.g, rgb.b);
        }

        /**
         * Converts HSL values to a Hex color string.
         * @param {number} h Hue (0-360)
         * @param {number} s Saturation (0-100)
         * @param {number} l Lightness (0-100)
         * @returns {string} Hex color string (e.g., "#RRGGBB")
         */
        function hslToHex(h, s, l) {
            const { r, g, b } = hslToRgb(h, s, l);
            const toHex = (c) => {
                const hex = Math.round(c).toString(16);
                return hex.length === 1 ? '0' + hex : hex;
            };
            return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
        }

        /**
         * Converts HSL values to an RGB string (e.g., "rgb(255, 0, 0)").
         * @param {number} h Hue (0-360)
         * @param {number} s Saturation (0-100)
         * @param {number} l Lightness (0-100)
         * @returns {string} RGB string.
         */
        function hslToRgbString(h, s, l) {
            const { r, g, b } = hslToRgb(h, s, l);
            return `rgb(${r}, ${g}, ${b})`;
        }

        /**
         * Converts RGB values to a Hex string.
         * @param {number} r Red value (0-255)
         * @param {number} g Green value (0-255)
         * @param {number} b Blue value (0-255)
         * @returns {string} Hex string (e.g., "#RRGGBB").
         */
        function rgbToHex(r, g, b) {
            const toHex = (c) => {
                const hex = Math.round(clamp(c, 0, 255)).toString(16);
                return hex.length === 1 ? '0' + hex : hex;
            };
            return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
        }

        /**
         * Converts HSL values to an HSL string (e.g., "hsl(0, 100%, 50%)").
         * @param {number} h Hue (0-360)
         * @param {number} s Saturation (0-100)
         * @param {number} l Lightness (0-100)
         * @returns {string} HSL string.
         */
        function hslToHslString(h, s, l) {
            return `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`;
        }

        /**
         * Clamps a value within a min/max range.
         * @param {number} value The value to clamp.
         * @param {number} min The minimum allowed value.
         * @param {number} max The maximum allowed value.
         * @returns {number} The clamped value.
         */
        function clamp(value, min, max) {
            return Math.max(min, Math.min(value, max));
        }

        /**
         * Adjusts hue value to stay within [0, 360).
         * @param {number} h Hue value.
         * @returns {number} Adjusted hue value.
         */
        function adjustHue(h) {
            return (h % 360 + 360) % 360;
        }

        /* --- Palette Generation Logic --- */

        /**
         * Generates a complementary color palette.
         * @param {object} hslBase {h, s, l} of the base color.
         * @returns {Array<object>} Array of {hex, rgb, hsl} color objects.
         */
        function generateComplementary(hslBase) {
            const hComp = adjustHue(hslBase.h + 180);
            return [
                { hex: hslToHex(hslBase.h, hslBase.s, hslBase.l), rgb: hslToRgbString(hslBase.h, hslBase.s, hslBase.l), hsl: hslToHslString(hslBase.h, hslBase.s, hslBase.l) },
                { hex: hslToHex(hComp, hslBase.s, hslBase.l), rgb: hslToRgbString(hComp, hslBase.s, hslBase.l), hsl: hslToHslString(hComp, hslBase.s, hslBase.l) }
            ];
        }

        /**
         * Generates an analogous color palette.
         * @param {object} hslBase {h, s, l} of the base color.
         * @returns {Array<object>} Array of {hex, rgb, hsl} color objects.
         */
        function generateAnalogous(hslBase) {
            const h1 = adjustHue(hslBase.h - 30); // -30 degrees hue shift
            const h2 = adjustHue(hslBase.h + 30); // +30 degrees hue shift
            return [
                { hex: hslToHex(h1, hslBase.s, hslBase.l), rgb: hslToRgbString(h1, hslBase.s, hslBase.l), hsl: hslToHslString(h1, hslBase.s, hslBase.l) },
                { hex: hslToHex(hslBase.h, hslBase.s, hslBase.l), rgb: hslToRgbString(hslBase.h, hslBase.s, hslBase.l), hsl: hslToHslString(hslBase.h, hslBase.s, hslBase.l) },
                { hex: hslToHex(h2, hslBase.s, hslBase.l), rgb: hslToRgbString(h2, hslBase.s, hslBase.l), hsl: hslToHslString(h2, hslBase.s, hslBase.l) }
            ];
        }

        /**
         * Generates a triadic color palette.
         * @param {object} hslBase {h, s, l} of the base color.
         * @returns {Array<object>} Array of {hex, rgb, hsl} color objects.
         */
        function generateTriadic(hslBase) {
            const h1 = adjustHue(hslBase.h);
            const h2 = adjustHue(hslBase.h + 120);
            const h3 = adjustHue(hslBase.h + 240);
            return [
                { hex: hslToHex(h1, hslBase.s, hslBase.l), rgb: hslToRgbString(h1, hslBase.s, hslBase.l), hsl: hslToHslString(h1, hslBase.s, hslBase.l) },
                { hex: hslToHex(h2, hslBase.s, hslBase.l), rgb: hslToRgbString(h2, hslBase.s, hslBase.l), hsl: hslToHslString(h2, hslBase.s, hslBase.l) },
                { hex: hslToHex(h3, hslBase.s, hslBase.l), rgb: hslToRgbString(h3, hslBase.s, hslBase.l), hsl: hslToHslString(h3, hslBase.s, hslBase.l) }
            ];
        }

        /**
         * Generates a monochromatic color palette.
         * @param {object} hslBase {h, s, l} of the base color.
         * @returns {Array<object>} Array of {hex, rgb, hsl} color objects.
         */
        function generateMonochromatic(hslBase) {
            const palette = [];
            // Generate darker shades
            for (let i = 2; i >= 1; i--) {
                const l = clamp(hslBase.l - i * 15, 5, 95); // Shift lightness by 15%
                palette.push({ hex: hslToHex(hslBase.h, hslBase.s, l), rgb: hslToRgbString(hslBase.h, hslBase.s, l), hsl: hslToHslString(hslBase.h, hslBase.s, l) });
            }
            // Add the base color
            palette.push({ hex: hslToHex(hslBase.h, hslBase.s, hslBase.l), rgb: hslToRgbString(hslBase.h, hslBase.s, hslBase.l), hsl: hslToHslString(hslBase.h, hslBase.s, hslBase.l) });
            // Generate lighter shades
            for (let i = 1; i <= 2; i++) {
                const l = clamp(hslBase.l + i * 15, 5, 95);
                palette.push({ hex: hslToHex(hslBase.h, hslBase.s, l), rgb: hslToRgbString(hslBase.h, hslBase.s, l), hsl: hslToHslString(hslBase.h, hslBase.s, l) });
            }
            return palette;
        }

        /* --- UI Update Functions --- */

        /**
         * Renders color swatches for a given palette into a target div.
         * Attaches event listeners for click (copy) and hover (tooltip).
         * @param {HTMLElement} targetDiv The div to append swatches to.
         * @param {Array<object>} colors Array of {hex, rgb, hsl} color objects.
         */
        function renderSwatches(targetDiv, colors) {
            targetDiv.innerHTML = ''; // Clear previous swatches
            colors.forEach(colorObj => {
                const swatch = document.createElement('div');
                swatch.className = 'color-swatch';
                swatch.style.backgroundColor = colorObj.hex;

                // Create tooltip element
                const tooltip = document.createElement('div');
                tooltip.className = 'swatch-tooltip';
                tooltip.innerHTML = `<strong>HEX:</strong> ${colorObj.hex.toUpperCase()}<br>` +
                                    `<strong>RGB:</strong> ${colorObj.rgb}<br>` +
                                    `<strong>HSL:</strong> ${colorObj.hsl}`;
                swatch.appendChild(tooltip);

                // Add click event listener to copy color to clipboard
                swatch.addEventListener('click', () => {
                    navigator.clipboard.writeText(colorObj.hex.toUpperCase()).then(() => {
                        showToast(`Copied ${colorObj.hex.toUpperCase()} to clipboard!`);
                    }).catch(err => {
                        console.error('Failed to copy text: ', err);
                        showToast('Failed to copy color.', true); // Show error toast
                    });
                });

                targetDiv.appendChild(swatch);
            });
        }

        /**
         * Shows a temporary toast notification.
         * @param {string} message The message to display.
         * @param {boolean} isError If true, styles as an error toast.
         */
        let toastTimeout;
        function showToast(message, isError = false) {
            clearTimeout(toastTimeout); // Clear any existing timeout

            toastNotification.textContent = message;
            toastNotification.classList.remove('show'); // Ensure reset for re-showing
            toastNotification.style.backgroundColor = isError ? 'rgba(200, 50, 50, 0.95)' : 'rgba(50, 200, 100, 0.95)';

            // Force reflow to restart CSS animation if already visible
            void toastNotification.offsetWidth;
            toastNotification.classList.add('show');

            // Hide after 3 seconds
            toastTimeout = setTimeout(() => {
                toastNotification.classList.remove('show');
            }, 3000);
        }

        /**
         * Updates the dynamic color strip banner at the top, with Lusion-like gradients.
         * @param {string} baseHex Base color in hex.
         * @param {Array<object>} complementaryPalette
         * @param {Array<object>} analogousPalette
         * @param {Array<object>} monochromaticPalette
         */
        function updateColorStripBanner(baseHex, complementaryPalette, analogousPalette, monochromaticPalette) {
            const baseHsl = hexToHsl(baseHex);

            // Function to generate light and dark versions for radial gradient
            const getLuminousColors = (hsl) => {
                // Ensure hsl is not null in case of invalid hex from picker
                if (!hsl) return { light: '#bb86fc', dark: '#9d63e0' }; // Fallback to accent color
                const lightL = clamp(hsl.l + 10, 0, 100);
                const darkL = clamp(hsl.l - 10, 0, 100);
                return {
                    light: hslToHex(hsl.h, hsl.s, lightL),
                    dark: hslToHex(hsl.h, hsl.s, darkL)
                };
            };

            const baseLum = getLuminousColors(baseHsl);
            baseColorSegment.style.setProperty('--segment-color-light', baseLum.light);
            baseColorSegment.style.setProperty('--segment-color-dark', baseLum.dark);

            const compLum = getLuminousColors(complementaryPalette[1] ? hexToHsl(complementaryPalette[1].hex) : null);
            complementaryColorSegment.style.setProperty('--segment-color-light', compLum.light);
            complementaryColorSegment.style.setProperty('--segment-color-dark', compLum.dark);

            const analLum = getLuminousColors(analogousPalette[0] ? hexToHsl(analogousPalette[0].hex) : null);
            analogousColorSegment.style.setProperty('--segment-color-light', analLum.light);
            analogousColorSegment.style.setProperty('--segment-color-dark', analLum.dark);

            const monoLum = getLuminousColors(monochromaticPalette[0] ? hexToHsl(monochromaticPalette[0].hex) : null);
            monochromaticColorSegment.style.setProperty('--segment-color-light', monoLum.light);
            monochromaticColorSegment.style.setProperty('--segment-color-dark', monoLum.dark);
        }

        /**
         * Updates the UI elements (button, text block, input, toggle, radio) with colors from generated palettes.
         * Also updates the dynamic aura effect on the container.
         * @param {string} baseHex The base color in hex format.
         * @param {object} hslBase {h, s, l} of the base color.
         * @param {Array<object>} complementaryPalette The generated complementary palette.
         * @param {Array<object>} monochromaticPalette The generated monochromatic palette.
         */
        function updateUIElements(baseHex, hslBase, complementaryPalette, monochromaticPalette) {
            const baseRgb = hslBase ? hslToRgb(hslBase.h, hslBase.s, hslBase.l) : {r:187, g:134, b:252}; // Fallback RGB
            const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim();

            // Demo Button
            demoButton.style.backgroundColor = baseHex;
            const buttonTextColor = complementaryPalette[1] ? complementaryPalette[1].hex : 'var(--text-light)'; // Use text-light as fallback
            demoButton.style.color = buttonTextColor;

            // Demo Text Block
            const textBlockBgColor = monochromaticPalette[0] ? monochromaticPalette[0].hex : 'rgba(255, 255, 255, 0.03)';
            const textBlockTextColor = monochromaticPalette[monochromaticPalette.length - 1] ? monochromaticPalette[monochromaticPalette.length - 1].hex : 'var(--text-light)';
            const textBlockBorderColor = monochromaticPalette[1] ? monochromaticPalette[1].hex : 'rgba(255, 255, 255, 0.1)';

            demoTextBlock.style.backgroundColor = textBlockBgColor;
            demoTextBlock.style.color = textBlockTextColor;
            demoTextBlock.style.borderColor = textBlockBorderColor;

            // New UI Elements: Dynamic Styling
            // Input Field
            demoInput.style.setProperty('--accent-color', baseHex); // Bind accent for focus glow
            demoInput.style.borderColor = textBlockBorderColor; // Use a monochromatic shade for consistency
            demoInput.style.color = textBlockTextColor; // Text color from monochromatic palette

            // Toggle Switch
            const slider = demoToggle.nextElementSibling;
            slider.style.setProperty('--accent-color', baseHex); // Bind accent for checked state
            // Initial state update for toggle
            if (demoToggle.checked) {
                slider.style.backgroundColor = baseHex;
                slider.style.boxShadow = `0 0 15px ${baseHex}, inset 0 0 8px rgba(0, 0, 0, 0.5)`;
            } else {
                slider.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                slider.style.boxShadow = `inset 0 0 8px rgba(0, 0, 0, 0.5)`;
            }

            // Radio Buttons
            radioOptions.forEach(radio => {
                const customRadio = radio.nextElementSibling; // The .radio-custom span
                customRadio.style.setProperty('--accent-color', baseHex); // Bind accent for checked state
                // Initial state update for radio buttons
                if (radio.checked) {
                    customRadio.style.borderColor = baseHex;
                    customRadio.style.backgroundColor = baseHex;
                    customRadio.style.boxShadow = `0 0 10px ${baseHex}, inset 0 0 5px rgba(0, 0, 0, 0.3)`;
                } else {
                    customRadio.style.borderColor = 'var(--border-color)';
                    customRadio.style.backgroundColor = 'transparent';
                    customRadio.style.boxShadow = `inset 0 0 5px rgba(0, 0, 0, 0.3)`;
                }
            });

            // Dynamic Aura on Container (Main content area)
            const container = document.querySelector('.container');
            const auraColor = `rgba(${baseRgb.r}, ${baseRgb.g}, ${baseRgb.b}, 0.18)`; // Subtle transparent base color, slightly more opaque
            container.style.boxShadow = `
                0 20px 80px var(--shadow-heavy),
                0 0 0 1px rgba(255, 255, 255, 0.05),
                0 0 50px ${auraColor} /* Dynamic glow based on base color */
            `;

            // Update Pricing Section Buttons
            pricingSignupButtons.forEach(button => {
                button.style.backgroundColor = baseHex;
                button.style.color = getComputedStyle(document.documentElement).getPropertyValue('--bg-primary').trim(); // Ensure text is dark
            });
        }

        /**
         * Main function to update all palette displays and UI elements.
         * Stores the current palette data globally.
         * @param {string} hexColor The selected base color in hex format.
         */
        function updatePlayground(hexColor) {
            // Update base color display
            baseColorValueDisplay.textContent = `Hex: ${hexColor.toUpperCase()}`;

            const hslBase = hexToHsl(hexColor);
            if (!hslBase) {
                console.error("Invalid hex color for updatePlayground:", hexColor);
                return;
            }

            // Update CSS variable for accent color to dynamically apply it globally
            document.documentElement.style.setProperty('--accent-color', hexColor);

            // Generate palettes
            const complementaryColors = generateComplementary(hslBase);
            const analogousColors = generateAnalogous(hslBase);
            const triadicColors = generateTriadic(hslBase);
            const monochromaticColors = generateMonochromatic(hslBase);

            // Store current palettes globally for palette management
            currentPalettes = {
                base: { hex: hexColor, hsl: hslToHslString(hslBase.h, hslBase.s, hslBase.l) },
                complementary: complementaryColors,
                analogous: analogousColors,
                triadic: triadicColors,
                monochromatic: monochromaticColors
            };

            // Render swatches for each palette
            renderSwatches(complementaryPaletteDiv, complementaryColors);
            renderSwatches(analogousPaletteDiv, analogousColors);
            renderSwatches(triadicPaletteDiv, triadicColors);
            renderSwatches(monochromaticPaletteDiv, monochromaticColors);

            // Update UI elements based on the generated palettes
            updateUIElements(hexColor, hslBase, complementaryColors, monochromaticColors);

            // Update the dynamic color strip banner
            updateColorStripBanner(hexColor, complementaryColors, analogousColors, monochromaticColors);
        }

        /* --- Modal Functions --- */

        /**
         * Shows a specific modal.
         * @param {HTMLElement} modalElement The modal overlay element to show.
         */
        function showModal(modalElement) {
            modalElement.classList.add('show');
            // Add event listener to close modal when clicking outside content (on overlay)
            modalElement.addEventListener('click', function handler(e) {
                if (e.target === modalElement) {
                    hideModal(modalElement);
                    modalElement.removeEventListener('click', handler); // Remove self after use
                }
            });
        }

        /**
         * Hides a specific modal.
         * @param {HTMLElement} modalElement The modal overlay element to hide.
         */
        function hideModal(modalElement) {
            modalElement.classList.remove('show');
        }

        /* --- Palette Management Functions --- */

        /**
         * Saves the current color palette to localStorage.
         */
        function savePalette() {
            try {
                localStorage.setItem('savedColorPalette', JSON.stringify(currentPalettes));
                showToast('Palette Saved Successfully!');
            } catch (e) {
                console.error("Failed to save palette to localStorage:", e);
                showToast('Failed to save palette. Storage might be full or blocked.', true);
            }
        }

        /**
         * Loads the saved color palette from localStorage.
         */
        function loadPalette() {
            try {
                const savedPaletteString = localStorage.getItem('savedColorPalette');
                if (savedPaletteString) {
                    const savedPalette = JSON.parse(savedPaletteString);
                    // Update the base color picker, which will trigger updatePlayground
                    if (savedPalette.base && savedPalette.base.hex) {
                        baseColorPicker.value = savedPalette.base.hex;
                        updatePlayground(savedPalette.base.hex);
                        showToast('Loaded Saved Palette!');
                    } else {
                        showToast('Saved palette data is incomplete or invalid.', true);
                    }
                } else {
                    showToast('No Saved Palette Found.', true);
                }
            } catch (e) {
                console.error("Failed to load palette from localStorage:", e);
                showToast('Failed to load palette. Data might be corrupted.', true);
            }
        }

        /**
         * Exports the current color palette to a modal textarea.
         */
        function exportPalette() {
            const formattedPalette = {
                baseColor: currentPalettes.base.hex,
                palettes: {
                    complementary: currentPalettes.complementary.map(c => c.hex),
                    analogous: currentPalettes.analogous.map(c => c.hex),
                    triadic: currentPalettes.triadic.map(c => c.hex),
                    monochromatic: currentPalettes.monochromatic.map(c => c.hex)
                },
                // Optional: add CSS variables format
                cssVariables: `:root {
    --color-base: ${currentPalettes.base.hex};
    --color-complementary: ${currentPalettes.complementary[1].hex};
    --color-analogous1: ${currentPalettes.analogous[0].hex};
    --color-analogous2: ${currentPalettes.analogous[2].hex};
    --color-monochromatic1: ${currentPalettes.monochromatic[0].hex};
    --color-monochromatic2: ${currentPalettes.monochromatic[1].hex};
    --color-monochromatic3: ${currentPalettes.monochromatic[2].hex};
    --color-monochromatic4: ${currentPalettes.monochromatic[3].hex};
    --color-monochromatic5: ${currentPalettes.monochromatic[4].hex};
}`
            };
            exportTextArea.value = JSON.stringify(formattedPalette, null, 2); // Pretty print JSON
            showModal(exportModal);
        }

        /* --- Color Converter Functions --- */

        /**
         * Displays an inline error message for a given input.
         * @param {HTMLElement} inputElement The input element.
         * @param {HTMLElement} errorElement The error message div.
         * @param {string} message The error message to display.
         */
        let errorTimeouts = {};
        function showInputError(inputElement, errorElement, message) {
            inputElement.classList.add('error');
            errorElement.textContent = message;
            errorElement.classList.add('show');
            clearTimeout(errorTimeouts[inputElement.id]);
            errorTimeouts[inputElement.id] = setTimeout(() => {
                inputElement.classList.remove('error');
                errorElement.classList.remove('show');
            }, 3000); // Hide error after 3 seconds
        }

        /**
         * Clears an inline error message.
         * @param {HTMLElement} inputElement The input element.
         * @param {HTMLElement} errorElement The error message div.
         */
        function clearInputError(inputElement, errorElement) {
            inputElement.classList.remove('error');
            errorElement.classList.remove('show');
            clearTimeout(errorTimeouts[inputElement.id]);
        }

        /**
         * Converts color from a source input and updates all other inputs and previews.
         * @param {string} source 'hex', 'rgb', or 'hsl'
         */
        function convertColor(source) {
            let hex = '';
            let rgb = null;
            let hsl = null;

            // Clear all errors first
            clearInputError(hexInput, hexErrorMessage);
            clearInputError(rgbInputR, rgbErrorMessage); // Targeting R as main for RGB errors
            clearInputError(hslInputH, hslErrorMessage); // Targeting H as main for HSL errors
            
            // Check for valid current base color from picker if any
            const currentBaseHex = baseColorPicker.value;
            const currentBaseHsl = hexToHsl(currentBaseHex);


            try {
                if (source === 'hex') {
                    const hexValue = hexInput.value.trim();
                    if (!/^#?([0-9A-Fa-f]{6})$/.test(hexValue)) {
                        showInputError(hexInput, hexErrorMessage, "Invalid Hex (e.g., #RRGGBB)");
                        converterPreviewHex.style.backgroundColor = 'transparent';
                        return;
                    }
                    hex = hexValue.startsWith('#') ? hexValue : '#' + hexValue;
                    rgb = hexToRgb(hex);
                    hsl = hexToHsl(hex);
                } else if (source === 'rgb') {
                    const r = parseInt(rgbInputR.value);
                    const g = parseInt(rgbInputG.value);
                    const b = parseInt(rgbInputB.value);

                    if (isNaN(r) || isNaN(g) || isNaN(b) || r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
                        showInputError(rgbInputR, rgbErrorMessage, "RGB values 0-255");
                        converterPreviewRgb.style.backgroundColor = 'transparent';
                        return;
                    }
                    rgb = { r, g, b };
                    hex = rgbToHex(r, g, b);
                    hsl = rgbToHsl(r, g, b);
                } else if (source === 'hsl') {
                    const h = parseInt(hslInputH.value);
                    const s = parseInt(hslInputS.value);
                    const l = parseInt(hslInputL.value);

                    if (isNaN(h) || isNaN(s) || isNaN(l) || h < 0 || h > 359 || s < 0 || s > 100 || l < 0 || l > 100) {
                        showInputError(hslInputH, hslErrorMessage, "HSL: H(0-359), S/L(0-100)");
                        converterPreviewHsl.style.backgroundColor = 'transparent';
                        return;
                    }
                    hsl = { h, s, l };
                    hex = hslToHex(h, s, l);
                    rgb = hslToRgb(h, s, l);
                }

                // Update all inputs and previews if conversion was successful
                if (hex && rgb && hsl) {
                    hexInput.value = hex.toUpperCase();
                    rgbInputR.value = rgb.r;
                    rgbInputG.value = rgb.g;
                    rgbInputB.value = rgb.b;
                    hslInputH.value = Math.round(hsl.h);
                    hslInputS.value = Math.round(hsl.s);
                    hslInputL.value = Math.round(hsl.l);

                    converterPreviewHex.style.backgroundColor = hex;
                    converterPreviewRgb.style.backgroundColor = hex;
                    converterPreviewHsl.style.backgroundColor = hex;
                } else {
                     // If for some reason conversion failed, clear previews and show error
                    converterPreviewHex.style.backgroundColor = 'transparent';
                    converterPreviewRgb.style.backgroundColor = 'transparent';
                    converterPreviewHsl.style.backgroundColor = 'transparent';
                }

            } catch (e) {
                console.error("Color conversion error:", e);
                if (source === 'hex') showInputError(hexInput, hexErrorMessage, "Invalid Hex");
                if (source === 'rgb') showInputError(rgbInputR, rgbErrorMessage, "Invalid RGB");
                if (source === 'hsl') showInputError(hslInputH, hslErrorMessage, "Invalid HSL");
                // Clear previews on conversion error
                converterPreviewHex.style.backgroundColor = 'transparent';
                converterPreviewRgb.style.backgroundColor = 'transparent';
                converterPreviewHsl.style.backgroundColor = 'transparent';
            }
        }

        /* --- Event Listeners & Initial Load --- */

        // Event listener for color picker changes
        baseColorPicker.addEventListener('input', (event) => {
            updatePlayground(event.target.value);
        });

        // Add event listeners for modal buttons
        loginButton.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default anchor link behavior
            showModal(loginModal);
        });

        aboutButton.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default anchor link behavior
            showModal(aboutModal);
        });

        supportButton.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default anchor link behavior
            showModal(supportModal);
        });

        // Close modal when clicking on the close button or overlay
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                // If click is directly on the overlay or on a close button within it
                if (e.target === overlay || e.target.classList.contains('modal-close-button')) {
                    hideModal(overlay);
                }
            });
        });

        // Frontend login form functionality (for demo purposes)
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Prevent actual form submission

            const usernameInput = loginForm.querySelector('#username');
            const passwordInput = loginForm.querySelector('#password');

            const username = usernameInput.value.trim();
            const password = passwordInput.value.trim();

            if (!username || !password) {
                showToast("Please enter both username/email and password.", true); // Error toast
            } else {
                showToast(`Login attempted for "${username}". (This is a demo, no actual login occurs.)`); // Success toast
                console.log(`Demo Login Attempt: Username/Email - "${username}", Password - "${password}"`);
                // Clear fields after successful demo attempt
                usernameInput.value = '';
                passwordInput.value = '';
                hideModal(loginModal); // Hide modal on successful demo attempt
            }
        });

        // Palette Management Event Listeners
        savePaletteBtn.addEventListener('click', savePalette);
        loadPaletteBtn.addEventListener('click', loadPalette);
        exportPaletteBtn.addEventListener('click', exportPalette);
        copyExportBtn.addEventListener('click', () => {
            exportTextArea.select();
            document.execCommand('copy'); // Fallback for navigator.clipboard.writeText
            showToast('Palette JSON copied to clipboard!');
        });

        // Color Converter Event Listeners
        hexInput.addEventListener('input', () => convertColor('hex'));
        rgbInputR.addEventListener('input', () => convertColor('rgb'));
        rgbInputG.addEventListener('input', () => convertColor('rgb'));
        rgbInputB.addEventListener('input', () => convertColor('rgb'));
        hslInputH.addEventListener('input', () => convertColor('hsl'));
        hslInputS.addEventListener('input', () => convertColor('hsl'));
        hslInputL.addEventListener('input', () => convertColor('hsl'));

        // Event listeners for new UI elements
        demoToggle.addEventListener('change', () => {
            const slider = demoToggle.nextElementSibling;
            if (demoToggle.checked) {
                slider.style.backgroundColor = baseColorPicker.value;
                slider.style.boxShadow = `0 0 15px ${baseColorPicker.value}, inset 0 0 8px rgba(0, 0, 0, 0.5)`;
            } else {
                slider.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                slider.style.boxShadow = `inset 0 0 8px rgba(0, 0, 0, 0.5)`;
            }
        });

        radioOptions.forEach(radio => {
            radio.addEventListener('change', () => {
                radioOptions.forEach(r => {
                    const customRadio = r.nextElementSibling;
                    if (r.checked) {
                        customRadio.style.borderColor = baseColorPicker.value;
                        customRadio.style.backgroundColor = baseColorPicker.value;
                        customRadio.style.boxShadow = `0 0 10px ${baseColorPicker.value}, inset 0 0 5px rgba(0, 0, 0, 0.3)`;
                    } else {
                        customRadio.style.borderColor = 'var(--border-color)';
                        customRadio.style.backgroundColor = 'transparent';
                        customRadio.style.boxShadow = `inset 0 0 5px rgba(0, 0, 0, 0.3)`;
                    }
                });
            });
        });


        // Initial load: Set up the playground with the default color
        document.addEventListener('DOMContentLoaded', () => {
            updatePlayground(baseColorPicker.value);
            // Initialize converter preview with default picker color
            hexInput.value = baseColorPicker.value;
            convertColor('hex');
        });