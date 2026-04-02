/* Neon Relic — Form Tools
   Makes blank templates fillable and printable.
   Include via: <script src="form-tools.js"></script> before </body>. */
(function () {
  /* ── inject form-specific styles ── */
  var css = document.createElement('style');
  css.textContent =
    '[contenteditable]:focus { outline: 2px solid rgba(45,90,39,0.3); outline-offset: 1px; }' +
    '@media print { [contenteditable] { outline: none !important; } }' +
    '.checkbox.filled { background: var(--ink); }' +
    '.pip.filled { background: var(--ink); }' +
    '.cpip.filled { background: var(--ink); color: var(--paper); }' +
    '.cpip.danger.filled { background: var(--red-stamp); color: var(--paper); }';
  document.head.appendChild(css);

  /* ── make text fields editable ── */
  var fields = document.querySelectorAll(
    '.field-value, .id-value, .skill-box, .attr-score, ' +
    '.talent-name, .talent-desc, .npc-field, ' +
    '.milestone-desc, .milestone-val, .milestone-day, ' +
    '.org-name-field, .org-val-field, .org-value-field, ' +
    '.truth-id, .truth-desc, .notes-line, ' +
    '.card-id, .back-id, .loc-id, ' +
    '.npc-name, .npc-org, .p2-agent-line, ' +
    '.gear-table td'
  );
  for (var i = 0; i < fields.length; i++) fields[i].contentEditable = 'true';

  /* ── make checkboxes / pips clickable ── */
  var toggles = document.querySelectorAll('.checkbox, .pip, .cpip');
  for (var j = 0; j < toggles.length; j++) {
    toggles[j].style.cursor = 'pointer';
    toggles[j].addEventListener('click', function () {
      this.classList.toggle('filled');
    });
  }
})();
