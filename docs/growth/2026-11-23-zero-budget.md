# ProductShotAI — vendite senza budget

Obiettivo esplicito dell'utente: almeno **€100 di vendite entro il 23 dicembre 2026**, senza ads e senza nuovi costi per strumenti o campagne. Le attività avvengono quando l'utente attiva la chat: nessuna automazione periodica.

## Indicatore che conta

Stripe è la fonte del denaro: pagamenti effettivamente riusciti, al netto dei rimborsi, distinti per valuta. Sessioni checkout, crediti assegnati manualmente e account di prova non sono vendite. I prezzi attuali sono USD: non sommare dollari a euro e non dedurre fatturato dal numero di crediti. Per confrontare vendite USD con la soglia EUR, documentare il cambio e la data usati o usare l'importo di regolamento EUR se disponibile.

Baseline del 23 novembre: nessun nuovo acquisto commerciale nel mese; nessun checkout commerciale successivo al rilascio del 22 novembre. La campagna recupero conta 304 invii accettati SMTP, zero attivazioni dal link, tre disiscrizioni. Non ripetere il blast a un giorno di distanza. Due notifiche 4.2.2 sono consegne ritardate a caselle piene, non hard bounce o prova di fake.

## Azioni di acquisizione realizzate

- Strumento pubblico gratuito: `/tools/product-photo-prompt-generator`. Genera testo da preferenze locali, senza account, email, upload, generazione immagini o chiamate API. È una risorsa utilizzabile anche da chi non compra.
- Guida pratica sulle foto di candele: `/blog/candle-product-photography-at-home`, con shot list, riferimento/illustrazione, prompt utilizzabili e passaggio a tool/studio.
- Guida a quattro prompt: `/blog/ai-product-photography-prompts`, con esempi, limiti e correzioni pratiche.
- Link da homepage, navigazione, footer, blog e tra le risorse. Nuove URL nella sitemap, canonical www, metadata articolo, immagini e date reali. Articoli prerenderizzati.
- CTA trasparenti: il prompt è gratuito, la generazione immagini costa crediti. Nessuna nuova prova gratuita che consumi fondi del provider.
- Eventi `prompt_builder_used` e `product_prompt_copied` con solo stile e formato, senza testo del prodotto o altri dati inseriti. Si applica il consenso analytics esistente.
- Non sono state create pagine ripetitive per decine di keyword. Le guide affrontano due compiti distinti e offrono un'utilità concreta. Nessun volume di ricerca inventato: Semrush richiede nuova autenticazione.

## Distribuzione: materiale pronto, collegamenti necessari

Verifica strumenti: Metricool non mostra reti collegate; Supermetrics indica TikTok Organic, Instagram e LinkedIn non autenticati. La ricerca plugin non ha restituito un connettore Reddit utilizzabile. Nessun post, commento o messaggio privato inviato. All'utente è stato chiesto durante il lavoro di collegare un profilo del progetto in Metricool. Usare soltanto il profilo ProductShotAI confermato, senza pubblicare su aziende/clienti non pertinenti.

### Post 1 — lancio della risorsa

**Testo:**
We made a free product photography prompt builder for small online stores.
Choose your product, a scene and a format. Copy the prompt and use it with your own reference photo.
No signup, no email, no image upload. It creates text, not a free AI image.
I'm part of ProductShotAI, which also offers a paid image studio. The prompt builder is free to use on its own.

**Link per il post:**
https://www.productshotai.com/tools/product-photo-prompt-generator?utm_source=instagram&utm_medium=organic_social&utm_campaign=free_prompt_builder_launch

**Media disponibili:** screenshot reale dello strumento oppure `/images/ugcBefore.png` e `/images/ugcAfter1.png`, etichettando il secondo come esempio generato con AI. Il visual non deve suggerire che il tool gratuito produca immagini.

### Post 2 — contenuto per venditori di candele

**Testo:**
Before you buy another prop for candle photos, capture these five views:
1. A clear front photo with a readable label.
2. The real lid and packaging included in the order.
3. Wax, wick and container details.
4. A real scale reference.
5. One uncluttered lifestyle scene.
We put the setup, review checklist and two example prompts in a short guide. I'm part of ProductShotAI; the guide is free, and the optional image studio is paid.

**Link:**
https://www.productshotai.com/blog/candle-product-photography-at-home?utm_source=instagram&utm_medium=organic_social&utm_campaign=candle_shot_plan

### Post 3 — errore comune nei prompt

**Testo:**
A longer product photo prompt isn't always a better one.
Start with: product reference → setting → lighting → framing → details to preserve → exclusions.
Change one element at a time. Always check labels and proportions: asking AI to preserve them isn't a guarantee.
We published four worked examples and a free text-prompt builder. I'm part of ProductShotAI.

**Link:**
https://www.productshotai.com/blog/ai-product-photography-prompts?utm_source=linkedin&utm_medium=organic_social&utm_campaign=worked_prompt_examples

### Commenti utili nelle community

Rispondere solo a richieste reali pertinenti, dopo aver letto le regole della community. Dichiarare il rapporto con ProductShotAI. Nessun invio massivo, finto cliente o messaggio privato non richiesto. I link vanno inseriti solo dove consentiti; una risposta utile può stare da sola.

Esempio per una domanda sulle foto di candele:
“Try a clean front photo at jar height with side window light, then a separate photo of the actual lid and packaging. Keep a real scale shot in the set. If you use AI for the lifestyle image, compare the label and rim against the reference before publishing. I work on ProductShotAI, so I'm biased toward trying AI for variations, but I'd keep the original photo for exact packaging details.”

Esempio per una domanda sui prompt:
“Start with one scene and one light direction. Name the cap/label/material details that must stay. Set the aspect ratio in the image tool as well as describing the framing. If the label keeps changing, use the original photo for that view. I work on a product-image tool; no prompt guarantees exact label reproduction.”

## Prossime verifiche manuali

- 25 novembre: Stripe e rimborsi, consegna/attivazione recupero, accessibilità nuove URL, utilizzo/copia tool, CTA e checkout. Verificare eventuali profili collegati e distribuire il materiale dopo conferma del profilo corretto.
- 30 novembre: sorgenti di visite reali, ingresso da guide/tool e acquisti; migliorare la risorsa che mostra intenzione commerciale. Non chiamare “vincente” un contenuto con poche visite.
- 7 e 14 dicembre: concentrare il lavoro sul canale con visite e checkout verificati. Nuovi contenuti solo se coprono bisogni distinti, non per riempire il blog.
- 23 dicembre: confronto pagamenti riusciti/rimborsi con €100, con conversione valutaria documentata.

Queste sono date di revisione suggerite, non esecuzioni programmate. Il lavoro SEO non garantisce indicizzazione, traffico o vendite entro la scadenza.

## Controlli eseguiti

Build e tipi/lint passati. Suite organica Chromium e WebKit a 320/390/768/1440px: prompt/preset/copia o selezione di fallback, nessuna API backend chiamata, input trattato come testo, articoli/metadata/sitemap/404 e arrivo al pacchetto Starter. Suite vendite Chromium ripassata alle quattro larghezze per verificare navigazione, attivazione in nuova scheda e scelta pack dopo la modifica della navigazione comune. Nessun invio marketing o acquisto durante queste prove. Screenshot locali in `artifacts/sales-20261123/organic` e `organic-webkit`, esclusi da Git.
