// TranslatTannoy — Simulated Announcement Feed
// "If it works in Egweil, it works anywhere."
//
// Real DB delays: rarely 8 minutes. Usually 23. Sometimes "we have chosen
// not to specify". Always apologetic in a way that feels bureaucratic.

const LINES = [
    { id: 'RE3', dest: 'Berlin Ostbahnhof', platform: '2' },
    { id: 'RE7', dest: 'Dessau Hauptbahnhof', platform: '1' },
    { id: 'RB14', dest: 'Berlin Schönefeld Flughafen', platform: '3' },
    { id: 'RE3', dest: 'Lutherstadt Wittenberg', platform: '2' },
    { id: 'S46', dest: 'Königs Wusterhausen', platform: '1' },
    { id: 'RB22', dest: 'Beelitz-Heilstätten', platform: '4' },
]

const DELAY_REASONS = [
    {
        de: 'aufgrund einer Störung im Betriebsablauf',
        en: 'due to an operational disruption',
    },
    { de: 'wegen eines vorausfahrenden Zuges', en: 'due to a preceding train' },
    { de: 'aufgrund von Bauarbeiten', en: 'due to engineering works' },
    { de: 'wegen einer technischen Störung', en: 'due to a technical fault' },
    { de: 'aufgrund von Verzögerungen im Netz', en: 'due to network delays' },
    {
        de: 'wegen des Fahrgastwechsels',
        en: 'due to extended passenger exchange',
    },
]

// Translations for the key announcement components
const T = {
    delay: {
        de: (line, dest, platform, mins, reason) =>
            `${line} nach ${dest}, Gleis ${platform}: ${mins} Minuten Verspätung ${reason.de}. Wir bitten um Entschuldigung.`,
        en: (line, dest, platform, mins, reason) =>
            `${line} to ${dest}, platform ${platform}: ${mins} minute delay ${reason.en}. We apologise for the inconvenience.`,
        tr: (line, dest, platform, mins, reason) =>
            `${line} ${dest} seferi, peron ${platform}: ${mins} dakika gecikme ${reason.en.replace('due to', 'nedeniyle')}. Özür dileriz.`,
        fr: (line, dest, platform, mins, reason) =>
            `${line} vers ${dest}, voie ${platform}: retard de ${mins} minutes ${reason.en.replace('due to', 'en raison de')}. Veuillez nous excuser.`,
        it: (line, dest, platform, mins, reason) =>
            `${line} per ${dest}, binario ${platform}: ritardo di ${mins} minuti. Ci scusiamo per il disagio.`,
        es: (line, dest, platform, mins, reason) =>
            `${line} hacia ${dest}, andén ${platform}: retraso de ${mins} minutos. Disculpen las molestias.`,
        ja: (line, dest, platform, mins, reason) =>
            `${line}番列車、${dest}行き、${platform}番ホーム：${mins}分遅延。ご不便をおかけして申し訳ございません。`,
    },
    platformChange: {
        de: (line, dest, oldP, newP) =>
            `Achtung! ${line} nach ${dest}: Gleisänderung! Bitte nutzen Sie Gleis ${newP} anstatt Gleis ${oldP}.`,
        en: (line, dest, oldP, newP) =>
            `Attention! ${line} to ${dest}: platform change! Please use platform ${newP} instead of platform ${oldP}.`,
        tr: (line, dest, oldP, newP) =>
            `Dikkat! ${line} ${dest} seferi: peron değişikliği! Lütfen ${oldP}. peron yerine ${newP}. peronu kullanın.`,
        fr: (line, dest, oldP, newP) =>
            `Attention! ${line} vers ${dest}: changement de voie! Utilisez la voie ${newP} au lieu de la voie ${oldP}.`,
        it: (line, dest, oldP, newP) =>
            `Attenzione! ${line} per ${dest}: cambio binario! Utilizzare il binario ${newP} invece del binario ${oldP}.`,
        es: (line, dest, oldP, newP) =>
            `¡Atención! ${line} hacia ${dest}: cambio de andén. Por favor use el andén ${newP} en vez del andén ${oldP}.`,
        ja: (line, dest, oldP, newP) =>
            `注意！${line}番列車、${dest}行き：ホーム変更！${oldP}番ホームの代わりに${newP}番ホームをご利用ください。`,
    },
    cancelled: {
        de: (line, dest, platform) =>
            `Achtung! ${line} nach ${dest}, Gleis ${platform}: Dieser Zug fällt heute aus. Bitte nutzen Sie den nächsten planmäßigen Zug.`,
        en: (line, dest, platform) =>
            `Attention! ${line} to ${dest}, platform ${platform}: This service is cancelled today. Please use the next scheduled train.`,
        tr: (line, dest, platform) =>
            `Dikkat! ${line} ${dest} seferi, peron ${platform}: Bu sefer bugün iptal edilmiştir. Lütfen bir sonraki treni kullanın.`,
        fr: (line, dest, platform) =>
            `Attention! ${line} vers ${dest}, voie ${platform}: ce train est supprimé aujourd'hui. Veuillez prendre le prochain train.`,
        it: (line, dest, oldP) =>
            `Attenzione! ${line} per ${dest}, binario ${oldP}: questo treno è soppresso oggi. Si prega di prendere il prossimo treno.`,
        es: (line, dest, platform) =>
            `¡Atención! ${line} hacia ${dest}, andén ${platform}: este tren está cancelado hoy. Por favor tome el siguiente tren.`,
        ja: (line, dest, platform) =>
            `注意！${line}番列車、${dest}行き、${platform}番ホーム：本日この列車は運休となります。次の列車をご利用ください。`,
    },
    arriving: {
        de: (line, dest, platform) =>
            `${line} nach ${dest} fährt jetzt ein auf Gleis ${platform}. Bitte Abstand von der Bahnsteigkante halten.`,
        en: (line, dest, platform) =>
            `${line} to ${dest} is now arriving at platform ${platform}. Please stand back from the platform edge.`,
        tr: (line, dest, platform) =>
            `${line} ${dest} seferi ${platform}. perona giriş yapıyor. Lütfen platform kenarından uzak durun.`,
        fr: (line, dest, platform) =>
            `Le ${line} vers ${dest} entre en gare voie ${platform}. Veuillez vous éloigner du bord du quai.`,
        it: (line, dest, platform) =>
            `${line} per ${dest} è in arrivo al binario ${platform}. Allontanarsi dal bordo della banchina.`,
        es: (line, dest, platform) =>
            `El ${line} hacia ${dest} está llegando al andén ${platform}. Por favor aléjense del borde del andén.`,
        ja: (line, dest, platform) =>
            `${line}番列車、${dest}行きが${platform}番ホームに入ります。ホームの端からお離れください。`,
    },
}

// Realistic DB delay distribution (minutes)
// Spoiler: not 8.
function randomDelay() {
    const r = Math.random()
    if (r < 0.15) return Math.floor(Math.random() * 5) + 3 // 3-7: actually punctual-ish
    if (r < 0.45) return Math.floor(Math.random() * 10) + 8 // 8-17: classic DB
    if (r < 0.75) return Math.floor(Math.random() * 15) + 18 // 18-32: having a day
    if (r < 0.9) return Math.floor(Math.random() * 20) + 33 // 33-52: philosophical
    return Math.floor(Math.random() * 30) + 53 // 53+: transcendent
}

function generateAnnouncement() {
    const line = LINES[Math.floor(Math.random() * LINES.length)]
    const reason =
        DELAY_REASONS[Math.floor(Math.random() * DELAY_REASONS.length)]
    const r = Math.random()

    let type, data

    if (r < 0.55) {
        type = 'delay'
        const mins = randomDelay()
        data = {
            line: line.id,
            dest: line.dest,
            platform: line.platform,
            mins,
            reason,
        }
    } else if (r < 0.7) {
        type = 'platformChange'
        const newPlatform = String(Math.floor(Math.random() * 4) + 1)
        const oldPlatform =
            line.platform !== newPlatform
                ? line.platform
                : String((parseInt(newPlatform) % 4) + 1)
        data = { line: line.id, dest: line.dest, oldPlatform, newPlatform }
    } else if (r < 0.8) {
        type = 'cancelled'
        data = { line: line.id, dest: line.dest, platform: line.platform }
    } else {
        type = 'arriving'
        data = { line: line.id, dest: line.dest, platform: line.platform }
    }

    // Build all translations
    const translations = {}
    for (const lang of Object.keys(T[type])) {
        try {
            if (type === 'delay')
                translations[lang] = T[type][lang](
                    data.line,
                    data.dest,
                    data.platform,
                    data.mins,
                    data.reason,
                )
            else if (type === 'platformChange')
                translations[lang] = T[type][lang](
                    data.line,
                    data.dest,
                    data.oldPlatform,
                    data.newPlatform,
                )
            else if (type === 'cancelled')
                translations[lang] = T[type][lang](
                    data.line,
                    data.dest,
                    data.platform,
                )
            else if (type === 'arriving')
                translations[lang] = T[type][lang](
                    data.line,
                    data.dest,
                    data.platform,
                )
        } catch (e) {
            translations[lang] = translations['en']
        }
    }

    return {
        id: Date.now(),
        type,
        data,
        translations,
        timestamp: new Date().toLocaleTimeString('de-DE', {
            hour: '2-digit',
            minute: '2-digit',
        }),
        platform:
            type === 'platformChange'
                ? data.newPlatform
                : data.platform || line.platform,
    }
}

// Export for use in main app
export { generateAnnouncement, LINES, T }
