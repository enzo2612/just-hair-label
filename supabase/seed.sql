-- Données de démonstration — clairement identifiées, à ne jamais présenter comme réelles.
-- Permet de voir l'application fonctionner avant d'y connecter de vrais salons labellisés.

insert into content_categories (nom, type, ordre) values
  ('Développement du chiffre d''affaires', 'chiffre_affaires', 1),
  ('Rentabilité et gestion', 'rentabilite', 2),
  ('Management et recrutement', 'management', 3),
  ('Communication et marketing', 'communication', 4),
  ('Fidélisation des clients', 'fidelisation', 5),
  ('Organisation et expérience client', 'organisation', 6);

insert into packs (nom, description, problematique, benefices, tarif, actif, ordre) values
  ('Pack Visibilité', 'Développement de la communication et de la présence digitale.', 'Mon salon est peu visible en ligne.', 'Plus de prises de rendez-vous issues du digital.', null, true, 1),
  ('Pack Performance', 'Optimisation du chiffre d''affaires, du ticket moyen et de la revente.', 'Mon panier moyen stagne.', 'Un ticket moyen en hausse mesurable.', null, true, 2),
  ('Pack Management', 'Accompagnement sur l''organisation et la motivation des équipes.', 'Mon équipe manque de cohésion.', 'Une équipe plus autonome et engagée.', null, true, 3),
  ('Pack Fidélisation', 'Développement de la récurrence des visites clients.', 'Mes clients ne reviennent pas assez souvent.', 'Une fréquence de visite en hausse.', null, true, 4),
  ('Pack Premium', 'Accompagnement personnalisé du dirigeant.', 'Je veux un suivi individuel régulier.', 'Un conseiller dédié, en continu.', null, true, 5);

insert into progression_steps (titre, objectif, explication, conseil, checklist, ordre) values
  ('Optimiser sa fiche Google', 'Être visible et rassurant pour les clients qui cherchent un salon près de chez eux.', 'Une fiche Google complète et à jour augmente directement les appels et les prises de rendez-vous.', 'Ajoutez des photos récentes et répondez à tous les avis, même négatifs.', array['Horaires à jour', 'Photos récentes', '10 avis minimum', 'Réponse à chaque avis'], 1),
  ('Améliorer le diagnostic client', 'Comprendre précisément le besoin de chaque client avant toute prestation.', 'Un diagnostic structuré évite les malentendus et ouvre la porte à des prestations complémentaires pertinentes.', 'Formalisez 5 questions systématiques posées à chaque nouveau client.', array['Questionnaire écrit', 'Formation de l''équipe', 'Suivi dans le dossier client'], 2),
  ('Développer la vente de soins', 'Augmenter le ticket moyen sans survente.', 'Un soin bien recommandé au bon moment est perçu comme un conseil, pas comme une vente.', 'Présentez le soin comme la réponse au diagnostic, jamais comme une option générique.', array['Argumentaire par type de besoin', 'Objectif mensuel par collaborateur'], 3),
  ('Structurer les réunions d''équipe', 'Aligner l''équipe sur les objectifs du mois.', 'Une réunion courte et régulière vaut mieux qu''une réunion longue et rare.', 'Limitez la réunion à 20 minutes avec un ordre du jour fixe.', array['Fréquence définie', 'Ordre du jour type', 'Compte-rendu partagé'], 4),
  ('Développer la fidélisation', 'Augmenter la fréquence de visite des clients existants.', 'Il coûte moins cher de faire revenir un client que d''en acquérir un nouveau.', 'Mettez en place une relance automatique à échéance du prochain rendez-vous conseillé.', array['Programme de fidélité actif', 'Relance à échéance', 'Suivi du taux de retour'], 5);
