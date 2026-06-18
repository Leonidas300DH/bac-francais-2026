import type { StudyLine } from "../types";

export function toLines(raw: string): StudyLine[] {
  return raw
    .trim()
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((text, index) => ({ number: index + 1, text }));
}

export const sourceTextsPartOne = {
  lesEffares: toLines(`
Noirs dans la neige et dans la brume,
Au grand soupirail qui s'allume,
Leurs culs en rond,
A genoux, cinq petits, - misère ! -
Regardent le boulanger faire
Le lourd pain blond...
Ils voient le fort bras blanc qui tourne
La pâte grise, et qui l'enfourne
Dans un trou clair.
Ils écoutent le bon pain cuire.
Le boulanger au gras sourire
Chante un vieil air.
Ils sont blottis, pas un ne bouge,
Au souffle du soupirail rouge,
Chaud comme un sein.
Et quand, pendant que minuit sonne,
Façonné, pétillant et jaune,
On sort le pain ;
Quand, sous les poutres enfumées,
Chantent les croûtes parfumées,
Et les grillons ;
Quand ce trou chaud souffle la vie
Ils ont leur âme si ravie
Sous leurs haillons,
Ils se ressentent si bien vivre,
Les pauvres petits pleins de givre !
- Qu'ils sont là, tous,
Collant leurs petits museaux roses
Au grillage, chantant des choses,
Entre les trous.
Mais bien bas, - comme une prière...
Repliés vers cette lumière
Du ciel rouvert,
- Si fort, qu'ils crèvent leur culotte,
- Et que leur lange blanc tremblote
Au vent d'hiver...
  `),

  leMal: toLines(`
Tandis que les crachats rouges de la mitraille
Sifflent tout le jour par l'infini du ciel bleu ;
Qu'écarlates ou verts, près du Roi qui les raille,
Croulent les bataillons en masse dans le feu ;
Tandis qu'une folie épouvantable broie
Et fait de cent milliers d'hommes un tas fumant ;
- Pauvres morts ! dans l'été, dans l'herbe, dans ta joie,
Nature ! ô toi qui fis ces hommes saintement ! ...
- Il est un Dieu, qui rit aux nappes damassées
Des autels, à l'encens, aux grands calices d'or ;
Qui dans le bercement des hosannah s'endort,
Et se réveille, quand des mères, ramassées
Dans l'angoisse, et pleurant sous leur vieux bonnet noir,
Lui donnent un gros sou lié dans leur mouchoir !
  `),

  revePourLHiver: toLines(`
A... Elle.
L'hiver, nous irons dans un petit wagon rose
Avec des coussins bleus.
Nous serons bien. Un nid de baisers fous repose
Dans chaque coin moelleux.
Tu fermeras l'oeil, pour ne point voir, par la glace,
Grimacer les ombres des soirs,
Ces monstruosités hargneuses, populace
De démons noirs et de loups noirs.
Puis tu te sentiras la joue égratignée...
Un petit baiser, comme une folle araignée,
Te courra par le cou...
Et tu me diras : "Cherche !" en inclinant la tête,
- Et nous prendrons du temps à trouver cette bête
- Qui voyage beaucoup...
  `),

  familiale: toLines(`
La mère fait du tricot
Le fils fait la guerre
Elle trouve ça tout naturel la mère
Et le père qu'est-ce qu'il fait le père ?
Il fait des affaires
Sa femme fait du tricot
Son fils la guerre
Lui des affaires
Il trouve ça tout naturel le père
Et le fils et le fils
Qu'est-ce qu'il trouve le fils ?
Il ne trouve rien absolument rien le fils
Le fils sa mère fait du tricot son père des affaires lui la guerre
Quand il aura fini la guerre
Il fera des affaires avec son père
La guerre continue la mère continue elle tricote
Le père continue il fait des affaires
Le fils est tué il ne continue plus
Le père et la mère vont au cimetière
Ils trouvent ça naturel le père et la mère
La vie continue la vie avec le tricot la guerre les affaires
Les affaires la guerre le tricot la guerre
Les affaires les affaires et les affaires
La vie avec le cimetière.
  `),

  portraitRaphael: toLines(`
Au premier coup d'oeil, les joueurs lurent sur le visage du novice quelque horrible mystère.
Ses jeunes traits étaient empreints d'une grâce nébuleuse, son regard attestait des efforts trahis, mille espérances trompées !
La morne impassibilité du suicide donnait à ce front une pâleur mate et maladive.
Un sourire amer dessinait le léger pli dans les coins de la bouche.
La physionomie exprimait une résignation qui faisait mal à voir.
Quelque secret génie scintillait au fond de ces yeux voilés peut-être par les fatigues du plaisir.
Était-ce la débauche qui marquait de son sale cachet cette noble figure jadis pure et brûlante, maintenant dégradée ?
Les médecins auraient sans doute attribué à des lésions au coeur ou à la poitrine le cercle jaune qui encadrait les paupières.
Les poètes eussent voulu reconnaître à ces signes les ravages de la science, les traces de nuits passées à la lueur d'une lampe studieuse.
Mais une passion plus mortelle que la maladie, une maladie plus impitoyable que l'étude et le génie, altéraient cette jeune tête.
Elle contractait ces muscles vivaces, tordait ce coeur qu'avaient seulement effleuré les orgies, l'étude et la maladie.
Comme lorsqu'un célèbre criminel arrive au bagne, les condamnés l'accueillent avec respect.
Ainsi tous ces démons humains, experts en tortures, saluèrent une douleur inouïe.
Ils reconnurent un de leurs princes à la majesté de sa muette ironie, à l'élégante misère de ses vêtements.
  `),

  antiquaire: toLines(`
Le vieux marchand remit la lampe sur la colonne où il l'avait prise.
Il lança au jeune homme un regard empreint d'une froide ironie qui semblait dire : Il ne pense déjà plus à mourir.
"Est-ce une plaisanterie, est-ce un mystère ?" demanda le jeune inconnu.
Le vieillard hocha de la tête et dit gravement : "Je ne saurais vous répondre."
"J'ai offert le terrible pouvoir que donne ce talisman à des hommes doués de plus d'énergie que vous ne paraissez en avoir."
"Aucun n'a voulu se risquer à conclure ce contrat si fatalement proposé."
"Et vous n'avez même pas essayé ?" dit le jeune homme en l'interrompant.
"Essayer !" dit le vieillard.
"Si vous étiez sur la colonne de la place Vendôme, essaieriez-vous de vous jeter dans les airs ?"
"Peut-on arrêter le cours de la vie ? L'homme a-t-il jamais pu scinder la mort ?"
"Avant d'entrer dans ce cabinet, vous aviez résolu de vous suicider."
"Mais tout à coup un secret vous occupe et vous distrait de mourir."
"Écoutez-moi. Je vais vous révéler en peu de mots un grand mystère de la vie humaine."
"L'homme s'épuise par deux actes instinctivement accomplis qui tarissent les sources de son existence."
"Deux verbes expriment toutes les formes que prennent ces deux causes de mort : VOULOIR et POUVOIR."
"Vouloir nous brûle et Pouvoir nous détruit : mais SAVOIR laisse notre faible organisation dans un perpétuel état de calme."
  `),

  mortRaphael: toLines(`
Raphaël tira de dessous son chevet le lambeau de la Peau de chagrin, fragile et petit comme la feuille d'une pervenche.
"Pauline, belle image de ma vie, disons-nous adieu", dit-il.
"Adieu ?" répéta-t-elle d'un air surpris.
"Oui, ceci est un talisman qui accomplit mes désirs, et représente ma vie."
"Vois ce qu'il m'en reste. Si tu me regardes encore, je vais mourir..."
La jeune fille crut Valentin devenir fou.
Elle prit le talisman, et alla chercher la lampe.
Éclairée par la lueur vacillante, elle examina le visage de son amant et la dernière parcelle de la Peau magique.
En la voyant belle de terreur et d'amour, il ne fut plus maître de sa pensée.
"Pauline, viens ! Pauline !"
Un cri terrible sortit du gosier de la jeune fille.
À mesure que grandissait ce désir, la Peau, en se contractant, lui chatouillait la main.
Sans réfléchir, elle s'enfuit dans le salon voisin dont elle ferma la porte.
"Pauline ! Pauline ! cria le moribond, je t'aime, je t'adore, je te veux !"
Par une force singulière, dernier éclat de vie, il jeta la porte à terre.
Pauline avait tenté vainement de se déchirer le sein et cherchait à s'étrangler avec son châle.
"Si je meurs, il vivra !" disait-elle.
Raphaël se jeta sur elle avec la légèreté d'un oiseau de proie.
Le moribond ne trouva que les sons étranglés du râle dans sa poitrine.
Enfin, ne pouvant bientôt plus former de sons, il mordit Pauline au sein.
Jonathas tenta d'arracher à la jeune fille le cadavre sur lequel elle s'était accroupie.
"Que demandez-vous ? dit-elle. Il est à moi, je l'ai tué, ne l'avais-je pas prédit ?"
  `),

  zolaOeuvre: toLines(`
Peu à peu, si la bravoure de son obstination paraissait grandir, il retombait pourtant à ses doutes d'autrefois.
Il était ravagé par la lutte qu'il soutenait contre la nature.
Toute toile qui revenait lui semblait mauvaise, incomplète surtout, ne réalisant pas l'effort tenté.
C'était cette impuissance qui l'exaspérait, plus encore que les refus du jury.
Quelle souffrance de ne jamais se donner entier dans le chef-d'oeuvre dont il ne pouvait accoucher son génie !
Il y avait toujours des morceaux superbes, il était content de celui-ci, de celui-là, de cet autre.
Alors pourquoi de brusques trous ? Pourquoi des parties indignes, tuant le tableau ensuite d'une tare ineffaçable ?
Il se sentait incapable de correction, un mur se dressait à un moment, un obstacle infranchissable.
S'il reprenait vingt fois le morceau, vingt fois il aggravait le mal.
Il s'énervait, ne voyait plus, n'exécutait plus, et arrivait à une véritable paralysie de la volonté.
Les crises se multipliaient, il recommençait à vivre des semaines abominables.
L'unique soutien, c'était le rêve consolateur de l'oeuvre future.
Par un phénomène constant, son besoin de créer allait ainsi plus vite que ses doigts.
Une seule hâte lui restait, se débarrasser du travail en train, dont il agonisait.
Ce qu'il ferait ensuite, ah ! ce qu'il ferait, il le voyait superbe et héroïque.
Perpétuel mirage qui fouette le courage des damnés de l'art.
  `),
};

export const sourceTextsPartTwo = {
  laboetiePeuples: toLines(`
Pauvres et misérables peuples insensés, nations opiniâtres en votre mal et aveugles à votre bien !
Vous vous laissez enlever sous vos yeux le plus beau et le plus clair de votre revenu.
Vous vivez de sorte que vous ne pouvez pas vous vanter que rien ne soit à vous.
Tout ce dégât vous vient non pas des ennemis, mais de l'ennemi.
De celui que vous faites si grand qu'il est.
Celui qui vous maîtrise tant n'a que deux yeux, n'a que deux mains, n'a qu'un corps.
Il n'a pas d'autre avantage que celui que vous lui faites pour vous détruire.
D'où a-t-il pris tant d'yeux dont il vous épie si vous ne les lui donnez ?
Comment a-t-il tant de mains pour vous frapper, s'il ne les prend de vous ?
Comment a-t-il aucun pouvoir sur vous, que par vous ?
Que pourrait-il vous faire, si vous n'étiez receleurs du larron qui vous pille ?
Vous semez vos fruits afin qu'il les ravage.
Vous nourrissez vos enfants afin qu'il les mène en ses guerres.
Vous vous rompez à la peine afin qu'il puisse se vautrer dans de sales plaisirs.
Vous vous affaiblissez, afin de le rendre plus fort.
Vous pouvez vous en délivrer si vous essayez seulement de vouloir le faire.
Soyez résolus de ne plus servir et vous voilà libres.
Vous le verrez comme un grand colosse à qui on a dérobé la base s'effondrer sous son propre poids.
  `),

  laboetieRuses: toLines(`
Cette ruse de tyran d'abêtir leurs sujets se voit dans ce que Cyrus fit aux Lydiens.
Après s'être emparé de Sardes, il apprit que les habitants s'étaient révoltés.
Ne voulant pas saccager une si belle ville, il s'avisa d'un grand stratagème.
Il y établit des bordels, des tavernes et des jeux publics.
Il fit publier une ordonnance pour que les habitants soient obligés de s'en servir.
Depuis, jamais il ne fallut tirer un coup d'épée contre les Lydiens.
Ces pauvres gens s'amusèrent à inventer toutes sortes de jeux.
Tous les tyrans n'ont pas ainsi déclaré vouloir affaiblir leurs gens.
Mais ce que celui-ci ordonna formellement, ils l'ont recherché discrètement.
Le peuple est soupçonneux envers celui qui l'aime et naïf envers celui qui le trompe.
Les peuples s'allèchent vite à la servitude par la moindre plume qu'on leur passe sous la bouche.
Les théâtres, les jeux, les farces, les spectacles et les gladiateurs étaient les appâts de la servitude.
Ils étaient le prix de leur liberté, les outils de la tyrannie.
Les peuples abêtis trouvaient beaux ces passe-temps.
Amusés d'un vain plaisir, ils s'accoutumaient à servir.
  `),

  laboetieFavoris: toLines(`
Il se trouve autant de gens à qui la tyrannie semble profitable que de ceux à qui la liberté serait agréable.
S'il y a quelque chose de gâté dans notre corps, tout se rend vers cette partie véreuse.
Pareillement, dès qu'un roi s'est déclaré tyran, toute la lie du royaume s'amasse autour de lui.
Ceux qui sont marqués par une ardente ambition et une notable avarice le soutiennent.
Ils veulent avoir part au butin et être sous le grand tyran des tyranneaux eux-mêmes.
Ainsi font les grands voleurs et les fameux corsaires.
Les uns courent le pays, les autres persécutent les voyageurs.
Les uns sont en embuscade, les autres font le guet.
Les autres massacrent, les autres dépouillent.
Il n'y en a pas un qui ne participe au moins à la recherche du butin.
Ainsi le tyran asservit les sujets les uns par le moyen des autres.
Il est gardé par ceux dont il devrait se méfier.
Comme on dit pour fendre le bois, il faut les coins du bois même.
  `),

  diderotTahitien: toLines(`
Et toi, chef des brigands qui t'obéissent, écarte promptement ton vaisseau de notre rive.
Nous sommes innocents, nous sommes heureux ; et tu ne peux que nuire à notre bonheur.
Nous suivons le pur instinct de la nature ; et tu as tenté d'effacer de nos âmes son caractère.
Ici tout est à tous ; et tu nous as prêché je ne sais quelle distinction du tien et du mien.
Nos filles et nos femmes nous sont communes ; tu as partagé ce privilège avec nous.
Tu es venu allumer en elles des fureurs inconnues.
Elles sont devenues folles dans tes bras ; tu es devenu féroce entre les leurs.
Nous sommes libres ; et voilà que tu as enfoui dans notre terre le titre de notre futur esclavage.
Tu n'es ni un dieu, ni un démon : qui es-tu donc, pour faire des esclaves ?
Ce pays est à nous. Ce pays est à toi ! et pourquoi ? parce que tu y as mis le pied ?
Si un Tahitien débarquait un jour sur vos côtes et écrivait : Ce pays appartient aux habitants de Tahiti, qu'en penserais-tu ?
Tu es le plus fort ! Et qu'est-ce que cela fait ?
Tu n'es pas esclave : tu souffrirais la mort plutôt que de l'être, et tu veux nous asservir !
Le Tahitien est ton frère. Vous êtes deux enfants de la nature.
Quel droit as-tu sur lui qu'il n'ait pas sur toi ?
Nous avons respecté notre image en toi.
  `),

  mussetBlazius: toLines(`
Une place devant le château.
LE CHOEUR. - Doucement bercé sur sa mule fringante, messer Blazius s'avance dans les bluets fleuris, vêtu de neuf, l'écritoire au côté.
Comme un poupon sur l'oreiller, il se ballotte sur son ventre rebondi, et les yeux à demi fermés, il marmotte un Pater noster dans son triple menton.
Salut, maître Blazius ; vous arrivez au temps de la vendange, pareil à une amphore antique.
MAÎTRE BLAZIUS. - Que ceux qui veulent apprendre une nouvelle d'importance m'apportent ici premièrement un verre de vin frais.
LE CHOEUR. - Voilà notre plus grande écuelle ; buvez, maître Blazius ; le vin est bon ; vous parlerez après.
MAÎTRE BLAZIUS. - Vous saurez, mes enfants, que le jeune Perdican, fils de notre seigneur, vient d'atteindre à sa majorité, et qu'il est reçu docteur à Paris.
Il revient aujourd'hui même au château, la bouche toute pleine de façons de parler si belles et si fleuries, qu'on ne sait que lui répondre les trois quarts du temps.
Toute sa gracieuse personne est un livre d'or.
Il ne voit pas un brin d'herbe à terre, qu'il ne vous dise comment cela s'appelle en latin.
Et quand il fait du vent ou qu'il pleut, il vous dit tout clairement pourquoi.
Vous ouvririez des yeux grands comme la porte que voilà, de le voir dérouler un des parchemins qu'il a coloriés d'encres de toutes couleurs, de ses propres mains et sans en rien dire à personne.
Enfin c'est un diamant fin des pieds à la tête, et voilà ce que je viens annoncer à M. le baron.
Vous sentez que cela me fait quelque honneur, à moi, qui suis son gouverneur depuis l'âge de quatre ans.
Ainsi donc, mes bons amis, apportez une chaise, que je descende un peu de cette mule-ci sans me casser le cou.
La bête est tant soit peu rétive, et je ne serais pas fâché de boire encore une gorgée avant d'entrer.
  `),

  mussetTiradeAmour: toLines(`
PERDICAN. - Sais-tu ce que c'est que des nonnes, malheureuse fille ?
Elles qui te représentent l'amour des hommes comme un mensonge, savent-elles qu'il y a pis encore, le mensonge de l'amour divin ?
Savent-elles que c'est un crime qu'elles font, de venir chuchoter à une vierge des paroles de femme ?
Ah ! comme elles t'ont fait la leçon !
Comme j'avais prévu tout cela quand tu t'es arrêtée devant le portrait de notre vieille tante !
Tu voulais partir sans me serrer la main ; tu ne voulais revoir ni ce bois, ni cette pauvre petite fontaine qui nous regarde tout en larmes.
Tu reniais les jours de ton enfance.
Et le masque de plâtre que les nonnes t'ont plaqué sur les joues me refusait un baiser de frère.
Mais ton cœur a battu ; il a oublié sa leçon, lui qui ne sait pas lire, et tu es revenue t'asseoir sur l'herbe où nous voilà.
Eh bien ! Camille, ces femmes ont bien parlé ; elles t'ont mise dans le vrai chemin.
Il pourra m'en coûter le bonheur de ma vie ; mais dis-leur cela de ma part : le ciel n'est pas pour elles.
CAMILLE. - Ni pour moi, n'est-ce pas ?
PERDICAN. - Adieu, Camille, retourne à ton couvent, et lorsqu'on te fera de ces récits hideux qui t'ont empoisonnée, réponds ce que je vais te dire :
Tous les hommes sont menteurs, inconstants, faux, bavards, hypocrites, orgueilleux et lâches.
Toutes les femmes sont perfides, artificieuses, vaniteuses, curieuses et dépravées.
Le monde n'est qu'un égout sans fond où les phoques les plus informes rampent et se tordent sur des montagnes de fange.
Mais il y a au monde une chose sainte et sublime, c'est l'union de deux de ces êtres si imparfaits et si affreux.
On est souvent trompé en amour, souvent blessé et souvent malheureux ; mais on aime.
Et quand on est sur le bord de sa tombe, on se retourne pour regarder en arrière.
Et on se dit : J'ai souffert souvent, je me suis trompé quelquefois, mais j'ai aimé.
C'est moi qui ai vécu, et non pas un être factice créé par mon orgueil et mon ennui.
Il sort.
  `),

  mussetRosette: toLines(`
Perdican, à haute voix, de manière que Camille l'entende - Je t'aime, Rosette ; toi seule au monde tu n'as rien oublié de nos beaux jours passés.
Toi seule tu te souviens de la vie qui n'est plus.
Prends ta part de ma vie nouvelle : donne-moi ton cœur, chère enfant ; voilà le gage de notre amour.
Il lui pose sa chaîne sur le cou.
Rosette. - Vous me donnez votre chaîne en or ?
Perdican. - Regarde à présent cette bague.
Lève-toi, et approchons-nous de cette fontaine.
Nous vois-tu tous les deux, dans la source, appuyés l'un sur l'autre ?
Vois-tu tes beaux yeux près des miens, ta main dans la mienne ?
Regarde tout cela s'effacer.
Il jette la bague dans l'eau.
Regarde comme notre image a disparu ; la voilà qui revient peu à peu.
l'eau qui s'était troublée reprend son équilibre ; elle tremble encore ; de grands cercles noirs courent à sa surface.
Patience, nous reparaissons ; déjà je distingue de nouveau tes bras enlacés dans les miens.
Encore une minute, et il n'y aura plus une ride sur ton joli visage ; regarde !
C'était une bague que m'avait donnée Camille.
Camille, à part. - Il a jeté ma bague dans l'eau.
Perdican. - Sais-tu ce que c'est que l'amour, Rosette ?
Écoute ! le vent se tait ; la pluie du matin roule en perles sur les feuilles séchées que le soleil ranime.
Par la lumière du ciel, par le soleil que voilà, je t'aime !
Tu veux bien de moi, n'est-ce pas ?
On n'a pas flétri ta jeunesse ; on n'a pas infiltré dans ton sang vermeil les restes d'un sang affadi ?
Tu ne veux as te faire religieuse ; te voilà jeune et belle dans les bras d'un jeune homme.
Ô Rosette ! sais-tu ce que c'est que l'amour ?
Rosette. - Hélas ! Monsieur le docteur, je vous aimerai comme je pourrai.
  `),

  domJuanDeuxPaysannes: toLines(`
Charlotte. - Est-ce, Monsieur, que vous lui avez promis de l'épouser ?
Dom Juan, bas, à Charlotte. - Vous vous raillez de moi.
Mathurine. - Est-il vrai, Monsieur, que vous lui avez donné parole d'être son mari ?
Dom Juan, bas, à Mathurine. - Pouvez-vous avoir cette pensée ?
Charlotte. - Vous voyez qu'al le soutient.
Dom Juan, bas, à Charlotte. - Laissez-la faire.
Mathurine. - Vous êtes témoin comme al l'assure.
Dom Juan, bas, à Mathurine. - Laissez-la dire.
Charlotte. - Non, non : il faut savoir la vérité.
Mathurine. - Il est question de juger ça.
Charlotte. - Oui, Mathurine, je veux que Monsieur vous montre votre bec jaune.
Mathurine. - oui, Charlotte, je veux que Monsieur vous rende un peu camuse.
Charlotte. - Monsieur, videz la querelle, s'il vous plaît.
Mathurine. - Mettez-nous d'accord, Monsieur.
Charlotte, à Mathurine. - Vous allez voir.
Mathurine, à Charlotte. - Vous allez voir vous-même.
Charlotte, à Dom Juan. - Dites.
Mathurine, à Dom Juan. - Parlez.
Dom Juan, embarrassé, leur dit à toutes deux : Que voulez-vous que je dise ? Vous soutenez également toutes deux que je vous ai promis de vous prendre pour femmes.
Est-ce que chacune de vous ne sait pas ce qui en est, sans qu'il soit nécessaire que je m'explique davantage ?
Pourquoi m'obliger là-dessus à des redites ?
Celle à qui j'ai promis effectivement n'a-t-elle pas en elle-même de quoi se moquer des discours de l'autre, et doit-elle se mettre en peine, pourvu que j'accomplisse ma promesse ?
Tous les discours n'avancent point les choses ; il faut faire et non pas dire, et les effets décident mieux que les paroles.
Aussi n'est-ce rien que par-là que je vous veux mettre d'accord, et l'on verra, quand je me marierai, laquelle des deux a mon cœur.
(Bas, à Mathurine) Laissez-lui croire ce qu'elle voudra.
(Bas, à Charlotte) Laissez-la se flatter dans son imagination.
(Bas, à Mathurine) Je vous adore.
(Bas, à Charlotte) Je suis tout à vous.
Bas, à Mathurine) Tous les visages sont laids auprès du vôtre.
(Bas, à Charlotte) On ne peut plus souffrir les autres quand on vous a vue.
J'ai un petit ordre à donner ; je viens vous retrouver dans un quart d'heure.
Charlotte, à Mathurine. - Je suis celle qu'il aime, au moins.
Mathurine. - C'est moi qu'il épousera.
Sganarelle. - Ah ! pauvres filles que vous êtes, j'ai pitié de votre innocence, et je ne puis souffrir de vous voir courir à votre malheur.
Croyez-moi l'une et l'autre : ne vous amusez point à tous les contes qu'on vous fait, et demeurez dans votre village.
  `),
};

export const sourceTexts = {
  ...sourceTextsPartOne,
  ...sourceTextsPartTwo,
};
