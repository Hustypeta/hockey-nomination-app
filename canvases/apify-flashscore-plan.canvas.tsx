import {
  Callout,
  Card,
  CardBody,
  CardHeader,
  Code,
  Divider,
  Grid,
  H1,
  H2,
  H3,
  Pill,
  Row,
  Stack,
  Table,
  Text,
  useHostTheme,
} from "cursor/canvas";

function Step({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  const theme = useHostTheme();
  return (
    <Grid columns="40px minmax(0, 1fr)" gap={12} align="start">
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: theme.accent.control,
          color: theme.text.onAccent,
          fontWeight: 700,
        }}
      >
        {number}
      </div>
      <Stack gap={5}>
        <H3>{title}</H3>
        {children}
      </Stack>
    </Grid>
  );
}

export default function ApifyFlashscorePlan() {
  const theme = useHostTheme();

  return (
    <Stack gap={24} style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <Stack gap={10}>
        <Row gap={8} wrap>
          <Pill active>Vybrané řešení</Pill>
          <Pill>Apify</Pill>
          <Pill>Tipsport extraliga</Pill>
        </Row>
        <H1>Jaké API použít pro statistiky a fantasy</H1>
        <Text tone="secondary">
          Doporučený postup od jednorázového Excelu až po automatické
          vyhodnocování fantasy soutěže.
        </Text>
      </Stack>

      <Callout tone="success" title="Krátká odpověď">
        Použij jeden Apify Actor:{" "}
        <Code>joaobrito/flashscore-sports-data-api</Code>. Actor od
        crawlerbros bych pro tento projekt nepoužíval jako hlavní zdroj. Je
        vhodný hlavně pro základní seznam zápasů a live výsledky, ale ne pro
        podrobná data jednotlivých hráčů.
      </Callout>

      <Grid columns="repeat(2, minmax(0, 1fr))" gap={16}>
        <Card size="lg">
          <CardHeader trailing={<Pill active size="sm">Použít</Pill>}>
            Flashscore Sports Data API
          </CardHeader>
          <CardBody>
            <Stack gap={10}>
              <Text weight="semibold">
                joaobrito/flashscore-sports-data-api
              </Text>
              <Text tone="secondary">
                Umí soutěže, zápasy, události, sestavy, týmové i hráčské
                profily a kariérní statistiky. To je rozsah potřebný pro Excel
                i fantasy.
              </Text>
              <Text>
                Hlavní režimy: <Code>competition</Code>,{" "}
                <Code>matchDetails</Code>, <Code>team</Code> a{" "}
                <Code>player</Code>.
              </Text>
            </Stack>
          </CardBody>
        </Card>

        <Card size="lg">
          <CardHeader trailing={<Pill size="sm">Jen doplněk</Pill>}>
            FlashScore Live Sports Scraper
          </CardHeader>
          <CardBody>
            <Stack gap={10}>
              <Text weight="semibold">crawlerbros Actor</Text>
              <Text tone="secondary">
                Hodí se na rychlé zjištění, které zápasy se hrají, jejich
                stavu a výsledku. Samotný ale nemusí dodat statistiky každého
                hráče potřebné k výpočtu fantasy bodů.
              </Text>
              <Text>
                Druhý Actor by navíc znamenal dvě různá schémata dat, složitější
                párování ID a více míst, kde může integrace selhat.
              </Text>
            </Stack>
          </CardBody>
        </Card>
      </Grid>

      <Stack gap={12}>
        <H2>Co přesně použít na jednotlivé úlohy</H2>
        <Table
          headers={["Úloha", "Režim Actoru", "Výsledek"]}
          rows={[
            [
              "Najít extraligu",
              <Code>search</Code>,
              "URL a identifikátor soutěže",
            ],
            [
              "Seznam zápasů sezony",
              <Code>competition</Code>,
              "Termíny, týmy, výsledky a matchId",
            ],
            [
              "Data jednoho zápasu",
              <Code>matchDetails</Code>,
              "Události, statistiky a sestavy",
            ],
            [
              "Soupisky klubů",
              <Code>team</Code>,
              "Hráči, týmy a vazby mezi nimi",
            ],
            [
              "Historie hráče",
              <Code>player</Code>,
              "Profil, kariérní statistiky a poslední zápasy",
            ],
            [
              "Průběžná kontrola výsledků",
              <Code>matchesByDate</Code>,
              "Levný seznam dnešních dokončených zápasů",
            ],
          ]}
          rowTone={["info", "info", "success", "info", "info", "success"]}
          striped
        />
      </Stack>

      <Stack gap={16}>
        <H2>Varianta A: jednorázové vytvoření Excelu</H2>
        <Step number="1" title="Najdi správnou soutěž a sezonu">
          <Text tone="secondary">
            Spusť Actor v režimu <Code>search</Code> s dotazem na Tipsport
            extraligu a sportem <Code>hockey</Code>. Z výsledku si ulož URL
            soutěže. Nepřebírej název soutěže ručně, protože ID je spolehlivější.
          </Text>
        </Step>
        <Step number="2" title="Stáhni seznam klubů a zápasů">
          <Text tone="secondary">
            Přes režim <Code>competition</Code> získej účastníky a všechny
            zápasy vybrané sezony. Výstup obsahuje identifikátory zápasů, které
            použiješ v dalším kroku.
          </Text>
        </Step>
        <Step number="3" title="Stáhni detaily dokončených zápasů">
          <Text tone="secondary">
            Pro každý dokončený zápas spusť <Code>matchDetails</Code> s
            událostmi, statistikami a sestavami. Z těchto záznamů se skládá
            tabulka výkonů hráčů.
          </Text>
        </Step>
        <Step number="4" title="Převeď JSON do tabulek">
          <Text tone="secondary">
            Vlastní serverový skript sjednotí hráče podle stabilního ID, sečte
            statistiky a vytvoří například listy Hráči, Zápasy a Výkony.
            Teprve tento zpracovaný výsledek se exportuje do XLSX nebo CSV.
          </Text>
        </Step>
      </Stack>

      <Divider />

      <Stack gap={16}>
        <H2>Varianta B: průběžný provoz fantasy</H2>
        <Step number="1" title="Pravidelně zkontroluj dnešní zápasy">
          <Text tone="secondary">
            Apify Scheduler spustí každých 15 až 30 minut levný režim{" "}
            <Code>matchesByDate</Code>. Aplikace si ponechá pouze zápasy
            extraligy se stavem <Code>finished</Code>.
          </Text>
        </Step>
        <Step number="2" title="Detail stáhni jen jednou">
          <Text tone="secondary">
            Když databáze ještě neobsahuje detail daného <Code>matchId</Code>,
            spusť <Code>matchDetails</Code>. Pokud už zápas zpracovaný je,
            nic znovu nestahuj. Tím se omezí opakované placení.
          </Text>
        </Step>
        <Step number="3" title="Spočítej fantasy body na vlastním serveru">
          <Text tone="secondary">
            Apify pouze dodá zdrojová data. Pravidla jako body za gól,
            asistenci, trestné minuty nebo zákroky brankáře patří do tvé
            aplikace a ukládají se do vlastní databáze.
          </Text>
        </Step>
        <Step number="4" title="Aktualizuj pořadí">
          <Text tone="secondary">
            Po uložení výkonů se přepočítají body uživatelských sestav a
            žebříček fantasy ligy. Web pak čte data z tvé databáze, ne přímo z
            Apify při každém otevření stránky.
          </Text>
        </Step>
      </Stack>

      <Card size="lg">
        <CardHeader>Tok dat v aplikaci</CardHeader>
        <CardBody>
          <Row gap={8} wrap align="center">
            {[
              "Flashscore",
              "Apify Actor",
              "serverová API route",
              "databáze",
              "výpočet fantasy bodů",
              "web a Excel",
            ].map((label, index, items) => (
              <Row key={label} gap={8} align="center">
                <div
                  style={{
                    padding: "8px 12px",
                    borderRadius: 6,
                    border: `1px solid ${theme.stroke.secondary}`,
                    background: theme.fill.tertiary,
                    color: theme.text.primary,
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  {label}
                </div>
                {index < items.length - 1 ? (
                  <Text tone="tertiary" weight="bold">→</Text>
                ) : null}
              </Row>
            ))}
          </Row>
        </CardBody>
      </Card>

      <Stack gap={12}>
        <H2>Důležité omezení před nákupem</H2>
        <Callout tone="warning" title="Nejdřív ověř jeden reálný hokejový zápas">
          Popis Actoru slibuje události, statistiky a sestavy, ale není jisté,
          že u extraligového hokeje vrátí všechny individuální položky, které
          budeš chtít ve fantasy — například střely hráče, čas na ledě, bodyčeky
          nebo přesný počet zákroků brankáře. Dostupnost určuje Flashscore.
        </Callout>
        <Text>
          První placený test proto udělej pouze na jednom dokončeném zápase.
          Sepiš požadované fantasy statistiky a zkontroluj, zda je každá z nich
          ve výstupu jednoznačně přiřazená k hráčskému ID. Pokud chybí, změna
          Actoru problém nemusí vyřešit; bude potřeba jiný datový zdroj.
        </Text>
      </Stack>

      <Stack gap={12}>
        <H2>Co znamenají pojmy v Apify</H2>
        <Grid columns="repeat(3, minmax(0, 1fr))" gap={12}>
          {[
            ["Actor", "Program, který získává data. V praxi je to API, které spouštíš."],
            ["Task", "Uložené nastavení Actoru, například extraliga a dnešní datum."],
            ["Run", "Jedno konkrétní spuštění Tasku nebo Actoru."],
            ["Dataset", "JSON výsledky vytvořené jedním během."],
            ["Schedule", "Časovač, který Task spouští automaticky."],
            ["API token", "Tajný klíč. Patří jen na server, nikdy do kódu prohlížeče."],
          ].map(([name, description]) => (
            <div
              key={name}
              style={{
                padding: 12,
                borderTop: `1px solid ${theme.stroke.secondary}`,
              }}
            >
              <Text weight="semibold">{name}</Text>
              <Text size="small" tone="secondary">{description}</Text>
            </div>
          ))}
        </Grid>
      </Stack>

      <Callout tone="neutral" title="GitHub propojení">
        Propojení Apify s GitHubem samo data nestahuje ani nesnižuje cenu.
        Pomůže pouze tehdy, když budeš vyvíjet vlastní Actor nebo nasazovat jeho
        zdrojový kód z repozitáře. Pro použití hotového Actoru z Apify Store ho
        nepotřebuješ.
      </Callout>
    </Stack>
  );
}
