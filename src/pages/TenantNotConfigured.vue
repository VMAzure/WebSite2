<template>
  <div style="padding:24px; max-width:900px; margin:0 auto; font-family: system-ui;">
    <h1 style="margin:0 0 12px;">Dominio / tenant non configurato</h1>

    <p style="margin:0 0 16px; opacity:.8;">
      Questo dominio non è associato a nessun dealer.
    </p>

    <div style="padding:16px; background:#f6f6f6; border:1px solid #e5e5e5;">
      <div><strong>Host:</strong> {{ host }}</div>
      <div style="margin-top:8px;"><strong>Come testare in locale:</strong></div>
      <code style="display:block; margin-top:6px;">
        /index/scuderia76<br />
        /index/europcarauto<br />
        /index/&lt;slug&gt;
      </code>
    </div>
  </div>
</template>

<script setup>
    const host = window.location.hostname
</script>
