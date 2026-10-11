/* ===========================================================
   VIGENÈRE APP
   Port of Pygenère (github.com/Ager90/Cifrado-Vigenere-Proyecto):
   encrypt/decrypt, statistical attack (χ² against Spanish or English
   letter frequencies), brute force and a speed benchmark.
   =========================================================== */
/* Letter frequencies (%), A–Z. Spanish is the same table as the Python version. */
const VIGENERE_LANGUAGES = {
  es: {
    name: "Spanish",
    note:
      "The attacks compare against Spanish letter frequencies, so they work best on Spanish text. " +
      "English or other languages may give the wrong key. Encrypting and decrypting work with any language.",
    freq: [
      12.53, 1.42, 4.68, 5.86, 13.68, 0.69, 1.01, 0.7, 6.25, 0.44, 0.02, 4.97, 3.15,
      6.71, 8.68, 2.51, 0.88, 6.87, 7.98, 4.63, 3.93, 0.9, 0.01, 0.22, 0.9, 0.52,
    ],
    example:
      "En un lugar de la Mancha, de cuyo nombre no quiero acordarme, no ha mucho tiempo que vivía " +
      "un hidalgo de los de lanza en astillero, adarga antigua, rocín flaco y galgo corredor. Una olla " +
      "de algo más vaca que carnero, salpicón las más noches, duelos y quebrantos los sábados, lentejas " +
      "los viernes, algún palomino de añadidura los domingos, consumían las tres partes de su hacienda.",
  },
  en: {
    name: "English",
    note:
      "The attacks compare against English letter frequencies, so they work best on English text. " +
      "Spanish or other languages may give the wrong key. Encrypting and decrypting work with any language.",
    freq: [
      8.17, 1.49, 2.78, 4.25, 12.7, 2.23, 2.02, 6.09, 6.97, 0.15, 0.77, 4.03, 2.41,
      6.75, 7.51, 1.93, 0.1, 5.99, 6.33, 9.06, 2.76, 0.98, 2.36, 0.15, 1.97, 0.07,
    ],
    example:
      "It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of " +
      "foolishness, it was the epoch of belief, it was the epoch of incredulity, it was the season of Light, " +
      "it was the season of Darkness, it was the spring of hope, it was the winter of despair, we had " +
      "everything before us, we had nothing before us, we were all going direct to Heaven.",
  },
};
const VIGENERE_EXAMPLE_KEY = "MIOS";

let attackLanguage = VIGENERE_LANGUAGES[store.get("vigenereLanguage", "es")] ? store.get("vigenereLanguage", "es") : "es";
const languageFreq = () => VIGENERE_LANGUAGES[attackLanguage].freq;

/* like normalizar_texto(): strip accents (Ñ → N), uppercase, keep A–Z only */
function normalizeText(text) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .replace(/[^A-Z]/g, "");
}

const toCodes = (text) => Array.from(normalizeText(text), (char) => char.charCodeAt(0) - 65);
const fromCodes = (codes) => codes.map((code) => String.fromCharCode(code + 65)).join("");

/* direction: 1 encrypts, -1 decrypts */
function vigenereShift(codes, keyCodes, direction) {
  return codes.map((code, i) => (code + direction * keyCodes[i % keyCodes.length] + 26) % 26);
}

/* same normalization, but numbers, spaces and line breaks are kept */
function prepareText(text) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .replace(/[^\S\n]+/g, " ")
    .replace(/[^A-Z0-9 \n]/g, "");
}

/* encrypts/decrypts the letters and leaves numbers and spaces untouched;
   the key only advances on letters, so the attacks (letters only) still line up */
function vigenereText(text, keyCodes, direction) {
  let k = 0;
  return prepareText(text).replace(/[A-Z]/g, (char) => {
    const shift = direction * keyCodes[k++ % keyCodes.length];
    return String.fromCharCode(((char.charCodeAt(0) - 65 + shift + 26) % 26) + 65);
  });
}

const exampleCiphertext = () =>
  vigenereText(VIGENERE_LANGUAGES[attackLanguage].example, toCodes(VIGENERE_EXAMPLE_KEY), 1);

function chiSquared(counts, total) {
  const freq = languageFreq();
  let chi = 0;
  for (let i = 0; i < 26; i++) {
    const expected = (total * freq[i]) / 100;
    chi += (counts[i] - expected) ** 2 / expected;
  }
  return chi;
}

function columnCounts(codes, length) {
  const columns = Array.from({ length }, () => new Array(26).fill(0));
  codes.forEach((code, i) => columns[i % length][code]++);
  return columns;
}

/* plaintext letter i comes from ciphertext letter i + shift */
function bestShift(counts) {
  const total = counts.reduce((sum, count) => sum + count, 0);
  let best = { shift: 0, chi: Infinity };
  for (let shift = 0; shift < 26; shift++) {
    const chi = chiSquared(counts.map((_, i) => counts[(i + shift) % 26]), total);
    if (chi < best.chi) best = { shift, chi };
  }
  return best;
}

function indexOfCoincidence(counts) {
  const total = counts.reduce((sum, count) => sum + count, 0);
  if (total < 2) return 0;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) / (total * (total - 1));
}

/* "MIOSMIOS" → "MIOS", so a repeated key is only listed once */
function shortestPeriod(key) {
  for (let period = 1; period < key.length; period++) {
    if (key.length % period === 0 && key.slice(0, period).repeat(key.length / period) === key) {
      return key.slice(0, period);
    }
  }
  return key;
}

function uniqueKeys(results) {
  const seen = new Set();
  return results
    .map((result) => ({ ...result, key: shortestPeriod(result.key) }))
    .filter((result) => !seen.has(result.key) && seen.add(result.key));
}

function statisticalAttack(codes, maxLength) {
  const results = [];
  const limit = Math.min(maxLength, Math.floor(codes.length / 2));
  for (let length = 1; length <= limit; length++) {
    const columns = columnCounts(codes, length);
    const fits = columns.map(bestShift);
    results.push({
      key: fromCodes(fits.map((fit) => fit.shift)),
      chi: fits.reduce((sum, fit) => sum + fit.chi, 0) / length,
      ioc: columns.reduce((sum, column) => sum + indexOfCoincidence(column), 0) / length,
    });
  }
  const ranking = uniqueKeys(results.slice().sort((a, b) => a.chi - b.chi));
  /* long keys overfit and can score slightly better than the real one, so the best guess
     is the shortest key whose χ² is close to the lowest one */
  const best = ranking
    .filter((result) => result.chi <= ranking[0].chi * 1.5)
    .sort((a, b) => a.key.length - b.key.length)[0];
  return { best, ranking: ranking.slice(0, 5) };
}

/* Tries every key up to maxLength, in small slices so the page stays responsive.
   Each key is scored with χ² on letter counts per column (same result as
   decrypting the whole text, but much faster). Returns a cancel function. */
function bruteForce(codes, maxLength, onProgress, onDone) {
  const total = Array.from({ length: maxLength }, (_, i) => 26 ** (i + 1)).reduce((a, b) => a + b, 0);
  const expected = languageFreq().map((freq) => (codes.length * freq) / 100);
  const combined = new Float64Array(26);
  const top = [];
  const start = performance.now();
  let length = 0;
  let digits = [];
  let columns = null;
  let tested = 0;
  let cancelled = false;

  function nextLength() {
    length++;
    digits = new Array(length).fill(0);
    /* each column is stored twice in a row so (i + shift) never needs a modulo */
    columns = new Int32Array(length * 52);
    codes.forEach((code, i) => {
      const base = (i % length) * 52;
      columns[base + code]++;
      columns[base + code + 26]++;
    });
  }

  function consider(chi) {
    if (top.length === 5 && chi >= top[4].chi) return;
    const key = shortestPeriod(fromCodes(digits));
    const existing = top.findIndex((entry) => entry.key === key);
    if (existing !== -1) {
      if (top[existing].chi <= chi) return;
      top.splice(existing, 1);
    }
    top.push({ key, chi });
    top.sort((a, b) => a.chi - b.chi);
    if (top.length > 5) top.pop();
  }

  function finish() {
    onDone({ top, tested, total, seconds: (performance.now() - start) / 1000, cancelled });
  }

  function step() {
    if (cancelled) return finish();
    const sliceEnd = performance.now() + 30;
    while (performance.now() < sliceEnd) {
      for (let batch = 0; batch < 2000; batch++) {
        combined.fill(0);
        for (let c = 0; c < length; c++) {
          const base = c * 52 + digits[c];
          for (let i = 0; i < 26; i++) combined[i] += columns[base + i];
        }
        let chi = 0;
        for (let i = 0; i < 26; i++) chi += (combined[i] - expected[i]) ** 2 / expected[i];
        consider(chi);
        tested++;

        let position = length - 1;
        while (position >= 0 && ++digits[position] === 26) digits[position--] = 0;
        if (position < 0) {
          if (length === maxLength) return finish();
          nextLength();
        }
      }
    }
    onProgress(tested, total, (performance.now() - start) / 1000);
    setTimeout(step, 0);
  }

  nextLength();
  setTimeout(step, 0);
  return () => (cancelled = true);
}

/* Like ejecutar_benchmark(): how many full decryptions per second this browser manages */
function runBenchmark(onDone) {
  const codes = toCodes(exampleCiphertext());
  const key = [0, 0, 0, 0];
  let count = 0;
  let busy = 0;
  (function tick() {
    const sliceStart = performance.now();
    while (performance.now() - sliceStart < 50) {
      for (let i = 0; i < 100; i++) {
        key[i % 4] = count % 26;
        vigenereShift(codes, key, -1);
        count++;
      }
    }
    busy += performance.now() - sliceStart;
    if (busy < 1000) setTimeout(tick, 0);
    else onDone({ rate: count / (busy / 1000), letters: codes.length });
  })();
}

function formatDuration(seconds) {
  if (seconds < 1) return Math.max(1, Math.round(seconds * 1000)) + " ms";
  if (seconds < 60) return seconds.toFixed(1) + " s";
  if (seconds < 3600) return (seconds / 60).toFixed(1) + " min";
  if (seconds < 86400) return (seconds / 3600).toFixed(1) + " h";
  if (seconds < 31557600) return (seconds / 86400).toFixed(1) + " days";
  return Math.round(seconds / 31557600).toLocaleString("en-GB") + " years";
}

const formatNumber = (number) => Math.round(number).toLocaleString("en-GB");

/* ---------- Vigenère window ---------- */
function decryptPreview(text, key) {
  const plain = vigenereText(text, toCodes(key), -1);
  return plain.length > 280 ? plain.slice(0, 280) + "…" : plain;
}

function bestKeyCard(label, key, meta, preview) {
  return `
    <div class="vig-best">
      <span class="vig-best-label">${label}</span>
      <span class="vig-best-key">${escapeHtml(key)}</span>
      <span class="vig-best-meta">${meta}</span>
      <pre class="vig-preview">${escapeHtml(preview)}</pre>
    </div>`;
}

function rankingTable(rows) {
  return `
    <table class="vig-table">
      <thead><tr><th>#</th><th>Key</th><th>Length</th><th>χ²</th></tr></thead>
      <tbody>${rows
        .map(
          (row, i) =>
            `<tr><td>${i + 1}</td><td class="mono">${escapeHtml(row.key)}</td>` +
            `<td>${row.key.length}</td><td>${row.chi.toFixed(1)}</td></tr>`
        )
        .join("")}</tbody>
    </table>`;
}

const vigError = (text) => `<p class="vig-error">${text}</p>`;

function setupVigenereApp() {
  const app = $("#vigenere");
  const tabs = $$("[data-tab]", app);

  function showTab(name) {
    tabs.forEach((tab) => tab.setAttribute("aria-selected", String(tab.dataset.tab === name)));
    $$("[data-panel]", app).forEach((panel) => (panel.hidden = panel.dataset.panel !== name));
  }
  tabs.forEach((tab) => tab.addEventListener("click", () => showTab(tab.dataset.tab)));

  /* attack language (Spanish / English letter frequencies) */
  function setAttackLanguage(code) {
    attackLanguage = code;
    store.set("vigenereLanguage", code);
    $$("[data-lang]", app).forEach((button) => {
      button.setAttribute("aria-checked", String(button.dataset.lang === code));
    });
    $("#vigLangNote").textContent = VIGENERE_LANGUAGES[code].note;
  }
  $$("[data-lang]", app).forEach((button) => {
    button.addEventListener("click", () => setAttackLanguage(button.dataset.lang));
  });
  setAttackLanguage(attackLanguage);

  function loadCiphertext(text) {
    $("#statsText").value = text;
    $("#bruteText").value = text;
  }
  $$("[data-example]", app).forEach((button) => {
    button.addEventListener("click", () => loadCiphertext(exampleCiphertext()));
  });

  /* encrypt / decrypt */
  function runCipher(direction) {
    const hasText = prepareText($("#vigText").value).trim() !== "";
    const key = toCodes($("#vigKey").value);
    const error = $("#vigError");
    error.hidden = true;
    if (!hasText || !key.length) {
      error.textContent = !hasText ? "Write some text first." : "The key needs at least one letter.";
      error.hidden = false;
      $("#vigOutput").hidden = true;
      return;
    }
    $("#vigResult").textContent = vigenereText($("#vigText").value, key, direction);
    $("#vigOutput").hidden = false;
  }
  $("#vigEncrypt").addEventListener("click", () => runCipher(1));
  $("#vigDecrypt").addEventListener("click", () => runCipher(-1));

  $("#vigCopy").addEventListener("click", (e) => {
    const button = e.currentTarget;
    navigator.clipboard
      .writeText($("#vigResult").textContent)
      .then(() => {
        button.textContent = "Copied!";
        setTimeout(() => (button.textContent = "Copy"), 1200);
      })
      .catch(() => {});
  });
  $("#vigCrack").addEventListener("click", () => {
    loadCiphertext($("#vigResult").textContent);
    showTab("stats");
  });

  /* statistical attack */
  $("#statsRun").addEventListener("click", () => {
    const codes = toCodes($("#statsText").value);
    const output = $("#statsResult");
    if (codes.length < 20) {
      output.innerHTML = vigError("Paste at least 20 letters of ciphertext (a few hundred work best).");
      return;
    }
    const maxLength = clamp(parseInt($("#statsMax").value, 10) || 20, 1, 30);
    const { best, ranking } = statisticalAttack(codes, maxLength);
    output.innerHTML =
      bestKeyCard(
        "Most likely key",
        best.key,
        `length ${best.key.length} · χ² ${best.chi.toFixed(1)} · IoC ${best.ioc.toFixed(3)}`,
        decryptPreview($("#statsText").value, best.key)
      ) +
      rankingTable(ranking) +
      '<p class="vig-note">Like the original: the ranking shows statistical plausibility, not guaranteed correctness.</p>';
  });

  /* brute force */
  let cancelBrute = null;
  $("#bruteRun").addEventListener("click", () => {
    const ciphertext = $("#bruteText").value;
    const codes = toCodes(ciphertext);
    const output = $("#bruteResult");
    if (codes.length < 10) {
      output.innerHTML = vigError("Paste at least 10 letters of ciphertext.");
      return;
    }
    const maxLength = Number($("#bruteMax").value);
    $("#bruteRun").disabled = true;
    $("#bruteCancel").hidden = false;
    output.innerHTML =
      '<div class="progress"><span id="bruteBar"></span></div><p class="vig-stats" id="bruteStats">Starting…</p>';

    cancelBrute = bruteForce(
      codes,
      maxLength,
      (tested, total, seconds) => {
        $("#bruteBar").style.width = (tested / total) * 100 + "%";
        $("#bruteStats").textContent =
          `${formatNumber(tested)} / ${formatNumber(total)} keys · ` +
          `${formatNumber(tested / seconds)} keys/s · ${seconds.toFixed(1)} s`;
      },
      ({ top, tested, total, seconds, cancelled }) => {
        cancelBrute = null;
        $("#bruteRun").disabled = false;
        $("#bruteCancel").hidden = true;
        const summary =
          `${cancelled ? "Canceled after" : "Tested"} ${formatNumber(tested)} of ${formatNumber(total)} keys ` +
          `in ${formatDuration(seconds)}.`;
        if (!top.length) {
          output.innerHTML = `<p class="vig-stats">${summary}</p>`;
          return;
        }
        output.innerHTML =
          bestKeyCard(
            cancelled ? "Best key so far" : "Best key",
            top[0].key,
            `length ${top[0].key.length} · χ² ${top[0].chi.toFixed(1)}`,
            decryptPreview(ciphertext, top[0].key)
          ) +
          rankingTable(top) +
          `<p class="vig-stats">${summary}</p>`;
      }
    );
  });
  $("#bruteCancel").addEventListener("click", () => cancelBrute && cancelBrute());

  /* benchmark */
  $("#benchRun").addEventListener("click", () => {
    const button = $("#benchRun");
    const output = $("#benchResult");
    button.disabled = true;
    output.innerHTML = '<p class="vig-stats">Measuring for about a second…</p>';
    runBenchmark(({ rate, letters }) => {
      button.disabled = false;
      const rows = Array.from({ length: 8 }, (_, i) => {
        const combinations = 26 ** (i + 1);
        return (
          `<tr><td>${i + 1}</td><td>${formatNumber(combinations)}</td>` +
          `<td>${formatDuration(combinations / rate)}</td></tr>`
        );
      }).join("");
      output.innerHTML = `
        <div class="vig-best">
          <span class="vig-best-label">Your browser</span>
          <span class="vig-best-key">${formatNumber(rate)}</span>
          <span class="vig-best-meta">decryptions per second (${letters}-letter text)</span>
        </div>
        <table class="vig-table">
          <thead><tr><th>Key length</th><th>Combinations</th><th>Estimated time</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>`;
    });
  });
}
setupVigenereApp();
