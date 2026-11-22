# Recupero account e GA4 — 22 novembre 2026

## Ambito autorizzato

Invio individuale agli account esistenti, inclusi quelli senza email verificata. Su indicazione esplicita dell'utente, sconto **30% su un acquisto per ogni destinatario**, anche in presenza di acquisti precedenti. Nessuna automazione periodica: i controlli futuri vengono attivati dall'utente in chat.

La lista esterna `contacts_optin.txt` contiene soltanto indirizzi di esempio e non aggiunge contatti reali. Non sono stati inventati destinatari non presenti nel database. Le liste, i vecchi script e i template preesistenti sono rimasti invariati.

## Inviti e protezione dello sconto

- 304 inviti preparati; un indirizzo escluso perché il dominio non presenta record MX. Il controllo MX verifica il dominio, non l'esistenza della casella né l'autenticità dell'utente. Nessuna eliminazione di account sulla base del nome.
- Email in inglese, coerente con il prodotto: scuse per il problema di verifica, invito a tornare, CTA personale, termini chiari e disiscrizione. Nessun pixel di apertura.
- Token casuali individuali; nel DB sono conservati soltanto gli hash. Il token è nel frammento URL, viene rimosso dalla barra del browser e non è incluso negli eventi analytics.
- Una visita GET/anteprima email non attiva l'account. Serve un POST dopo il clic sul pulsante. Il link di attivazione è utilizzabile una sola volta; dopo l'uso, login normale e offerta restano disponibili per quell'account.
- Validità dell'invito e dell'offerta: 14 giorni dalla preparazione, fino al 6 dicembre 2026 all'ora indicata nell'email. Non è necessario acquistare per riattivare l'account.
- Coupon Stripe di 30%, applicato dal backend soltanto agli account invitati, senza codice promozionale pubblico. Consente un solo acquisto scontato per account, indipendentemente dagli acquisti precedenti.
- Blocco DB, chiave Stripe di idempotenza persistita prima della richiesta e riutilizzo della sessione aperta impediscono checkout scontati duplicati. Cambiare pacchetto scade la precedente sessione aperta. Un pagamento completato in attesa di webhook impedisce un secondo checkout scontato.
- Il webhook di pagamento marca l'offerta come utilizzata e accredita i crediti nella stessa transazione DB.
- Tabella aggiuntiva dedicata agli inviti. Nessuna migrazione distruttiva, nessuna verifica massiva delle email.
- Registro di invio riprendibile: ogni invio è registrato prima della chiamata SMTP; gli invii incerti non vengono ritentati automaticamente. Un messaggio per destinatario, senza esposizione degli altri indirizzi.
- Credenziali locali e manifest contenente i link sono esclusi da Git e protetti con permessi 0600. Il manifest si trova in `db_backup/recovery-20261122/manifest.json`: non pubblicarlo.

## GA4

- Proprietà dedicata ProductShotAI: `565422804`, ID di misurazione fornito dall'utente `G-WZ92N353JW`. Già visibile tramite Supermetrics sull'account Google collegato.
- Installazione diretta del Google tag, senza aggiungere anche il container GTM fornito dall'utente, per evitare doppio tracciamento.
- Tag Google caricato soltanto dopo consenso analytics; pubblicità e personalizzazione negate. Possibilità di rifiutare o revocare il consenso; cookie GA rimossi alla revoca. Informativa aggiornata.
- Page view e passaggi del funnel: iscrizione, verifica, login, recupero, selezione pacchetto, checkout, upload/generazione ed esiti. L'evento ecommerce `purchase` usa ID transazione, importo effettivo, valuta e pacchetto solo dopo conferma del pagamento e accredito DB. I dati Stripe/DB restano la fonte contabile; GA può mancare per rifiuto del consenso, ad blocker o abbandono prima del ritorno dal pagamento.
- Disabilitate le page view implicite con impostazione globale prima dell'inizializzazione; l'utente ha inoltre disattivato i cambi pagina basati sulla cronologia nella misurazione avanzata di GA4. Referrer sanitizzato preservando dominio/percorso per l'attribuzione del traffico, senza query o frammenti.
- Query string, frammenti, email, prompt e immagini esclusi dagli eventi. Nessun vecchio dato di altri siti attribuito a ProductShotAI.
- Prova sul dominio pubblico: nessuna richiesta Google prima del consenso; dopo consenso `page_view` accettato HTTP 204 da GA4 per l'ID corretto. Revoca: zero cookie GA residui. Prova finale dopo la correzione globale: esattamente una page view per homepage e pricing, entrambe HTTP 204, referrer Google senza query; parametro email della pagina di verifica assente dalle richieste GA4. È stato rispettato il tempo di batching del tag nella verifica delle richieste.

## Verifiche e rilascio

- 22 test backend isolati superati, inclusi OTP, proprietà della sessione, accrediti idempotenti, link sconosciuto/scaduto/già utilizzato, GET senza effetti, disiscrizione, requisiti dell'offerta e checkout con chiave persistita.
- Build Next.js di produzione e TypeScript completati.
- Nuove schermate recupero/offerta provate a 320, 390 e 1440px; percorso completo e menu riprovati sul dominio pubblico; 10 route × 5 larghezze, nessun overflow orizzontale né errore JavaScript rilevato. Prove Chromium, non una certificazione su ogni dispositivo/browser.
- Signup reale tramite API di produzione verso alias della casella mittente: OTP realmente ricevuto in Gmail, verificato via endpoint, login con password riuscito. Account sintetico rimosso.
- Email di recupero reale ricevuta nella casella Gmail di prova: link personale estratto dal messaggio effettivo, aperto in Chromium mobile sul dominio pubblico, clic di attivazione, login e offerta 30% visualizzata senza API simulate. Record sintetici rimossi.
- Recupero reale tramite API di produzione: GET non verifica; POST attiva una sola volta; password conservata; account con acquisto precedente riceve il 30%; altro account non invitato non riceve l'offerta e non può leggere la sessione altrui.
- Richieste checkout simultanee restituiscono la stessa sessione. Cambio pacchetto scade la precedente sessione, verificato direttamente in Stripe. Una sessione non pagata non accredita crediti.
- Stripe live: Starter da $4,95 a $3,46, sconto $1,49; Standard da $13,35 a $9,34, sconto $4,01, con arrotondamento Stripe. Totale e voce del 30% verificati anche nella pagina checkout mobile.
- Nessun pagamento con carta effettuato durante queste prove. L'effettivo webhook di un nuovo acquisto pagato non è stato provocato: coperto da test isolati e riconciliazione degli acquisti precedenti.
- Gli account e i dati sintetici sono rimossi al termine. Escludere dalle future analisi commerciali le sessioni Stripe non pagate create per audit; quella Starter del recupero è stata esplicitamente scaduta dal cambio pacchetto.
- Commit applicazione: `1596d919c70f02b7804e02d686601c8f887b82df`.
- Frontend analytics finale: `062c1eae9a269c29430546714d87f81e5ea3ed11`; metriche manuali e prima sanitizzazione: `bbe68500d5b9f029d29d7007104a3fab959dd88f`.
- Vercel produzione READY dopo la correzione finale GA4: https://vercel.com/simoncinids-projects/product-shot-ai/3Z3x8Rd2mJGvBGxutbJdDTQDYw7U
- Render LIVE: `dep-dc1f7lqfngtc73fg7h90`. Push senza nuovi eventi di auto deploy: avvio manuale e stato live verificati.

## Esito invio

- **304 email individuali accettate da Gmail SMTP; zero rifiuti SMTP, zero invii incerti, zero invii pendenti.**
- Un indirizzo escluso prima dell'invio per assenza di record MX.
- Alla verifica immediatamente successiva all'invio, nessun hard bounce attribuibile a questa campagna nella casella mittente. Una disiscrizione reale già registrata; nessuna riattivazione o acquisto dall'offerta ancora registrati in questa primissima finestra.
- Accettazione SMTP non equivale a consegna in inbox. Anche l'assenza di bounce immediato non prova l'esistenza o l'autenticità della casella. Eventuali notifiche ritardate andranno ricontrollate alla prossima attivazione manuale.
- Riepilogo aggregato ripetibile, senza invii: `python3 backend/scripts/recovery_campaign_stats.py`. I conteggi sono calcolati dal DB; nessun pixel di apertura e nessuna stima inventata degli open rate.
