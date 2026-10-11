/* ===========================================================
   GRAPHENEOS GUIDE APP
   A copy of the README at github.com/Er0ga/GrapheneOS-for-normal-usage_privacy-without-paranoia,
   split into sections. If the repo changes, update the text here.
   =========================================================== */
const GRAPHENE_REPO = "https://github.com/Er0ga/GrapheneOS-for-normal-usage_privacy-without-paranoia";

const GRAPHENE_SECTIONS = [
  {
    title: "Intro",
    meta: "what this is",
    body: `
      <h2>GrapheneOS for normal usage</h2>
      <p><em>privacy without paranoia</em></p>
      <p>
        A simple guide to set up GrapheneOS on Google Pixel devices. It is intended for users who want better
        privacy and control of their mobile device without sacrificing usability or spending much time.
      </p>
      <p>
        I created this repo because when I looked for resources on how to set up GrapheneOS, almost every one I
        found aimed at users with extreme privacy concerns (at the expense of usability). I just wanted a
        practical, everyday smartphone experience with better privacy and control, without giving up much
        usability or spending excessive time configuring it.
      </p>
      <p class="guide-source">
        This is a copy of the guide inside MiOS.
        <a href="${GRAPHENE_REPO}" target="_blank" rel="noopener">Read the original on GitHub</a>.
      </p>
    `,
  },
  {
    title: "Installation",
    meta: "WebUSB installer",
    body: `
      <h2>Installation</h2>
      <p>
        Open up a web browser and go to the
        <a href="https://grapheneos.org/install/" target="_blank" rel="noopener">official installation page</a>
        (here I am going to explain the
        <a href="https://grapheneos.org/install/web" target="_blank" rel="noopener">WebUSB-based installer</a>
        because it is the easiest method). Before continuing, check if your browser, OS and mobile are supported.
      </p>
      <blockquote>
        All Google Pixel devices from Pixel 6 through Pixel 10 Pro Fold are supported by GrapheneOS, but you can
        check your specific model on
        <a href="https://grapheneos.org/releases" target="_blank" rel="noopener">grapheneos.org/releases</a>.
      </blockquote>
      <blockquote>
        Only Chromium-based browsers are supported: Chromium (outside Ubuntu), Vanadium, Google Chrome, Microsoft
        Edge, Brave (without Shields enabled). Do not use incognito mode on the browser.
      </blockquote>
      <blockquote>
        Almost every major OS is supported, but you can check yours in the
        <a href="https://grapheneos.org/install/web#prerequisites" target="_blank" rel="noopener">prerequisites</a>.
      </blockquote>
      <ol>
        <li>
          <strong>Enable OEM unlocking.</strong> Enable the Developer options menu: go to
          <strong>Settings &gt; About phone/tablet</strong> and tap the <strong>Build number</strong> entry until
          you see a message confirming that developer mode is enabled. Then go to
          <strong>Settings &gt; System &gt; Developer options</strong> and enable <strong>OEM unlocking</strong>.
          On some devices you must be connected to Wi-Fi to enable this, as it checks if the phone has been
          reported as stolen. <strong>Verizon Pixel phones cannot</strong> have their bootloader unlocked, which
          is a requirement for installing GrapheneOS.
        </li>
        <li>
          <strong>Boot into the bootloader.</strong> Reboot the phone and hold the volume down button. On some
          Windows systems you may need to install
          <a href="https://grapheneos.org/install/web#connecting-device" target="_blank" rel="noopener">fastboot drivers</a>.
        </li>
        <li>
          <strong>Unlock the bootloader.</strong> Connect the phone to your computer with a USB-C cable. In your
          browser, click
          <a href="https://grapheneos.org/install/web#unlocking-the-bootloader" target="_blank" rel="noopener">Unlock bootloader</a>,
          select your phone in the pop-up window and click <strong>Connect</strong>. On your phone you will see
          <strong>Do not unlock the bootloader</strong> next to the power button. Press the volume up or down
          button to change the option to <strong>Unlock the bootloader</strong>, then press the power button to
          confirm.
        </li>
        <li>
          <strong>Flash GrapheneOS.</strong> Click
          <a href="https://grapheneos.org/install/web#obtaining-factory-images" target="_blank" rel="noopener">Download release</a>
          to download the factory images for your device. Once the download is complete, click
          <strong>Flash release</strong>. This flashes the firmware and wipes all previous data.
          <strong>Important: do not interact with the device until the flashing process is finished.</strong>
        </li>
        <li>
          <strong>Lock the bootloader.</strong> After flashing, click <strong>Lock bootloader</strong>. This is
          crucial for the security and integrity of the device. On your phone you will see
          <strong>Do not lock the bootloader</strong> next to the power button. Press the volume up or down button
          to change it to <strong>Lock the bootloader</strong>, then press the power button. The screen should
          display "Device state: locked". Press <strong>Start</strong> with the power button.
        </li>
        <li>
          <strong>Finish the setup.</strong> Complete the initial GrapheneOS setup. For security, disable OEM
          unlocking again: <strong>Settings &gt; About phone/tablet</strong>, tap <strong>Build number</strong> if
          developer mode isn't already enabled, then <strong>Settings &gt; System &gt; Developer options</strong>
          and disable <strong>OEM unlocking</strong>. You can now also disable the Developer options menu.
        </li>
      </ol>
      <blockquote>
        Every time you switch your device on or off, you will see a warning on the screen. This is normal and
        happens because you are not running Google's official OS.
      </blockquote>
    `,
  },
  {
    title: "Getting apps",
    meta: "stores & alternatives",
    body: `
      <h2>Getting apps</h2>
      <p>
        GrapheneOS has an app called <strong>App Store</strong> with the official GrapheneOS apps (Auditor, Camera,
        Info, Messaging, PDF Viewer), <a href="https://accrescent.app/" target="_blank" rel="noopener">Accrescent</a>
        and the ones from the Google ecosystem (mirror): Android Auto, Google Play Store, Google Play services and
        Markup.
      </p>

      <h3>App stores</h3>
      <ul>
        <li>
          <a href="https://f-droid.org/" target="_blank" rel="noopener">F-Droid</a> — the premier app store for
          open source Android applications, prioritizing privacy and user freedom. The one I recommend. Apps cannot
          depend on Google Play Services, are checked for security problems before they are added, and you can see
          the permissions and versions of each app.
        </li>
        <li>
          <a href="https://auroraoss.com/aurora-store" target="_blank" rel="noopener">Aurora Store</a> — the most
          popular free and open source alternative to the Google Play Store, an anonymous Play Store client.
        </li>
        <li>
          <a href="https://play.google.com/store/" target="_blank" rel="noopener">Google Play Store</a> — Google's
          official app store. Unlike the others you need to sign in. Some apps can only be installed through this
          store or have limitations otherwise, for example Google Maps, WhatsApp or banking apps.
        </li>
      </ul>

      <h3>De-Googling your apps</h3>
      <p>To reduce reliance on big tech companies, consider privacy-focused alternatives for your daily needs:</p>
      <ul>
        <li>
          <strong>Email:</strong> private providers such as
          <a href="https://proton.me/mail" target="_blank" rel="noopener">Proton Mail</a> or
          <a href="https://tutanota.com/" target="_blank" rel="noopener">Tutanota</a>. If you already have a Gmail
          account, use an open-source client like
          <a href="https://www.thunderbird.net/" target="_blank" rel="noopener">Thunderbird</a> instead of the
          closed-source Gmail app.
        </li>
        <li>
          <strong>Browsers:</strong>
          <a href="https://grapheneos.org/features#vanadium" target="_blank" rel="noopener">Vanadium</a> is a
          robust option available out of the box. <a href="https://brave.com/" target="_blank" rel="noopener">Brave</a>
          and <a href="https://www.mozilla.org/en-US/firefox/mobile/" target="_blank" rel="noopener">Firefox</a>
          (with privacy settings adjusted) are also strong alternatives.
        </li>
        <li>
          <strong>Password managers:</strong> an open-source one like
          <a href="https://proton.me/pass" target="_blank" rel="noopener">Proton Pass</a> or
          <a href="https://www.keepassdx.com/" target="_blank" rel="noopener">KeePassDX</a>.
        </li>
        <li>
          <strong>YouTube:</strong> for ad-free, telemetry-free, background-playing viewing without an account, try
          <a href="https://newpipe.net/" target="_blank" rel="noopener">NewPipe</a>. For almost the same
          experience with your account, use YouTube in Brave.
        </li>
        <li>
          <strong>Basic apps:</strong> for gallery, calendar, file manager, etc., check out
          <a href="https://fossify.org/" target="_blank" rel="noopener">Fossify</a>. Available on Aurora Store and
          F-Droid.
        </li>
        <li>
          <strong>Maps:</strong> <a href="https://organicmaps.app/" target="_blank" rel="noopener">Organic Maps</a>
          and <a href="https://osmand.net/" target="_blank" rel="noopener">OsmAnd</a> are two strong open source
          alternatives to Google Maps, but in my opinion they are far from offering a similar experience.
        </li>
      </ul>

      <h3>Additional notes and limitations</h3>
      <ul>
        <li>
          <strong>Mobile payment wallets:</strong> I haven't found an open-source alternative to Google Wallet that
          allows contactless payments on GrapheneOS, and Google Wallet is not compatible with it. To store tickets
          (bus, plane, concert, etc.) you can try <a href="https://fossify.org/" target="_blank" rel="noopener">FossWallet</a>,
          available on F-Droid and Aurora Store.
        </li>
        <li>
          <strong>Android Auto:</strong> I haven't tested it on GrapheneOS. According to the official
          documentation, compatibility may vary — see the
          <a href="https://grapheneos.org/usage#android-auto" target="_blank" rel="noopener">Android Auto section</a>.
        </li>
        <li>
          <strong>GPS:</strong> you won't be able to use GPS and precise location in any app out of the box. See
          the <em>Location &amp; GPS</em> section.
        </li>
      </ul>

      <h3>Other recommended apps</h3>
      <ul>
        <li><strong>2FA:</strong>
          <a href="https://getaegis.app/" target="_blank" rel="noopener">Aegis</a>,
          <a href="https://ente.io/auth" target="_blank" rel="noopener">Ente Auth</a>,
          <a href="https://proton.me/authenticator" target="_blank" rel="noopener">Proton Auth</a></li>
        <li><strong>Photos:</strong>
          <a href="https://ente.io/" target="_blank" rel="noopener">Ente Photos</a>,
          <a href="https://immich.app/" target="_blank" rel="noopener">Immich</a></li>
        <li><strong>Notes:</strong>
          <a href="https://notesnook.com/" target="_blank" rel="noopener">Notesnook</a>,
          <a href="https://obsidian.md/" target="_blank" rel="noopener">Obsidian</a>,
          <a href="https://cryptee.com/" target="_blank" rel="noopener">Cryptee</a></li>
        <li><strong>Cloud storage:</strong>
          <a href="https://proton.me/drive" target="_blank" rel="noopener">Proton Drive</a>,
          <a href="https://syncthing.net/" target="_blank" rel="noopener">Syncthing</a>,
          <a href="https://filen.io/" target="_blank" rel="noopener">Filen</a>,
          <a href="https://nextcloud.com/" target="_blank" rel="noopener">Nextcloud</a></li>
      </ul>

      <h3>Where to find more apps</h3>
      <ul>
        <li><a href="https://privacytools.techlore.tech/" target="_blank" rel="noopener">PrivacyTools by Techlore</a></li>
        <li><a href="https://privacyguides.org/en/tools/" target="_blank" rel="noopener">Privacy Guides</a></li>
        <li><a href="https://alternativeto.net/platform/android/" target="_blank" rel="noopener">AlternativeTo</a></li>
      </ul>
    `,
  },
  {
    title: "Location & GPS",
    meta: "navigation, Google Maps",
    body: `
      <h2>Location and GPS</h2>
      <p>
        GrapheneOS isolates your location data by default. To get navigation apps working without leaking your IP
        address or location history to Google, you need to configure the redirection services manually.
      </p>
      <ol>
        <li>
          <strong>Enable the global location.</strong> Go to <strong>Settings &gt; Location</strong> and enable
          <strong>Use location</strong> (off by default). Unlike standard Android, enabling this does not
          immediately start sending data to the cloud.
        </li>
        <li>
          <strong>Configure privacy proxies.</strong> Tap <strong>Location services</strong>. Set
          <strong>Secure User Plane Location (SUPL)</strong> and
          <strong>Predicted Satellite Data Service (PSDS)</strong> to <strong>GrapheneOS proxy</strong>, and make
          sure <strong>Network location</strong> and <strong>Geocoder</strong> also use the
          <strong>GrapheneOS proxy</strong>. External servers (like Google's or Qualcomm's) will see the proxy's IP
          address instead of yours, so you get a GPS lock without showing your location.
        </li>
        <li>
          <strong>Disable background scanning.</strong> In the same menu, I recommend disabling
          <strong>Wi-Fi scanning</strong> and <strong>Bluetooth scanning</strong>. On standard Android these are on
          by default "to improve accuracy", but they constantly broadcast signals to nearby devices even when you
          aren't using them. Turning them off prevents this passive tracking and improves battery life.
        </li>
        <li>
          <strong>App permissions.</strong> When you open a map app (like Organic Maps) for the first time, select
          <strong>Allow only while using the app</strong> — not "Allow all the time" if you want to prevent
          background usage. Make sure <strong>Use precise location</strong> is <strong>ON</strong> if you need
          turn-by-turn navigation.
        </li>
      </ol>

      <h3>Google Maps</h3>
      <p>
        To use <strong>Google Maps</strong> normally on GrapheneOS, beyond the settings above, you must install
        <strong>Google Play Store</strong> and <strong>Google Play Services</strong> from the GrapheneOS
        <strong>App Store</strong>.
      </p>
      <ol>
        <li>
          After installing Google Play Services, go to <strong>Settings &gt; Apps &gt; Google Play Services</strong>
          and enable <strong>Allow background activity</strong> and <strong>Allow network access</strong>.
        </li>
        <li>
          Install <strong>Google Maps</strong> from the Google Play Store. When you first open the app, grant it
          <strong>location permissions</strong> and <strong>precise location</strong> (select
          <strong>Allow only while using the app</strong>).
        </li>
      </ol>
    `,
  },
];

function showGrapheneSection(index) {
  const content = $("#grapheneContent");
  content.innerHTML = GRAPHENE_SECTIONS[index].body;
  content.scrollTop = 0;
  $$(".sidebar-item", $("#grapheneSidebar")).forEach((item, i) => {
    item.classList.toggle("is-active", i === index);
    item.setAttribute("aria-current", String(i === index));
  });
}

function renderGraphene() {
  const sidebar = $("#grapheneSidebar");
  GRAPHENE_SECTIONS.forEach((section, index) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "sidebar-item";
    item.innerHTML =
      `<span class="sidebar-item-title">${section.title}</span>` +
      `<span class="sidebar-item-meta">${section.meta}</span>`;
    item.addEventListener("click", () => showGrapheneSection(index));
    sidebar.appendChild(item);
  });
  showGrapheneSection(0);
}
renderGraphene();
