# SPDX-License-Identifier: Apache-2.0

## v2.0.0

## Milestone: Release v2.0.0
Date: 2024-07-18T07:00:00Z
Description: Create Release v2.0.0 release using Github Actions release workflow.

### 🐞 Bug Fixes

- fix: node version in node.js workflow (Linked Issues: 8f095e33287dca13182223fbdfb32c64db86ae32)
- fix: Update node 16 to 20 node.js.yml (Linked Issues: 49eade4f5efe637891c55b61e477fe1ff8934618)
- fix: remove failing scorecard (#136) (Linked Issues: b5d1ec0d05cbdbdda72b1149e98d4a67a8f9c293)
- fix: networkConfiguration instead of networkMapConfiguration (Linked Issues: 40e98a579fe96f55f398d6a6366c63d6ee04750e)
- fix: adding different transaction types (Linked Issues: 3bf760bfd1d96225e73c58f01513a6538337960a)
- fix: more channel removals (Linked Issues: 93dd1ed874e5bc8ee7da44faabf75a71f2ba9eee)
- fix: tsconfig module and module resolution (Linked Issues: 567c8dc2fbdb80cf5aea887acf6cd18b494c7435)

### ⭐️ New Features

- feat: Enhancement to the release workflow (Linked Issues: 094c9131df9111bd1d263f2cbfa01eec91d70ef8)
- feat: refine and add new workflows (#127) (Linked Issues: 2364bc815af5dbc35607c2f973791d1be868980d)
- feat: bumped version (Linked Issues: 76260667bb89173e19abd65005d842f341dcc066)
- feat: attaching cache to transactions (Linked Issues: bb574b0104aa8e700974404947588edf0125a6ec)
- feat: Added release and milestone workflows. (Linked Issues: 63f444f2c1becd6709a1213b1c62cd31f432159a)
- feat: spelling fix (Linked Issues: f735f803bb401986270dc3c0522158c6f5f685cb)
- feat: improved data structure (Linked Issues: a37d7127583f06ec8ade2fb75e41128f24f9f4a3)
- feat: add method for getting report by msgid (Linked Issues: 5379f2bb94a7ad8bf440d0da40be7082b2571a4a)
- feat: remove crsp from metadata (Linked Issues: bff5395e4dc3b9f8c58db6d1a53ac665d9aa1b8e)
- feat: change CADP to TADP and update metadata (Linked Issues: f5c89a0b115542ea89b7ad35ce6e7e3e59a91b28)
- feat: fully remove ruleConfig outcome (Linked Issues: a89c8ae1252c9ddd291fd2c36ba3e7f7b6be5b23)
- feat: remove transaction configuration (Linked Issues: 48f8a57a4306c7c1eac61b78c9e91339368d45a1)
- feat: remove getRuleMap channels (Linked Issues: db4b83fd7a014a0061a93faec7768985da03fd4b)
- feat: remove ruleresults' result (Linked Issues: bb780e52d73923081f07dccd64d160f2d813986d)
- feat: remove channels (Linked Issues: 9cb00edaa1f8a618e3784bbceb455e14638aceec)

### 🔨 Refactorings

- refactor: move networkMap config to configurationDB (Linked Issues: fae3538a71772d8ffa3a07eb969422a187f3dbdd)
- refactor: rename configuration collection to ruleConfiguration (Linked Issues: bc7dcf65dc043357cf91b5368e6f6f5b82d4af57)
- refactor: rename typologyExpression to typologyConfiguration (Linked Issues: 26c9760efb34c4aca284c3c924f2b8b47cbc73f1)
- refactor: remove deprecated redis method (Linked Issues: 020b6db85f96b9cd85402b9c2fc56a20c599f5e5)
- refactor: remove JSON Schema (Linked Issues: 2442215bbe2372af815aa1bf4cb16519db1380f4)
- refactor: bump lib version (Linked Issues: b72be8ebeb683e33a23a0740d413efef350795c6)

### ⚙️ Chores

- chore: update linting, publish and deps (Linked Issues: cb6d3804f8f41fe69a31d3aad295cbffaf19b0c4)
- chore: added eslint rule (Linked Issues: e26164c1309c1846048745f36a4db174fa5bdefe)
- chore: update license and remove dead dep (Linked Issues: 3a25b32eddabb8616f505b69e7006d815f8872a6)
- chore: updated eslint and project dependencies (Linked Issues: fd2d1af6a7cb63b5373b0a24e8cf430e885f5a2f)
- chore: add license header (Linked Issues: a2f1a5c34d3010e63cfc6712f18f292db8155020)
- chore: add license header (Linked Issues: 84b85a5e45a676b0659beb6d84caf22f6436359f)
- chore: data types docs (Linked Issues: bf03a606cf0f667e6db6d8e03b615bf87b66ecd2)
- chore: update docs (Linked Issues: 65aabb42e507e96d199e0e7670680089d6c6393b)
- chore: linting (Linked Issues: da052977ce6c71d5e3fca9d2076463853a00817d)

### 🏗️ Build

- build: bump lib ver (Linked Issues: 22f02833db44bf1b4605b8f78e3e406b0e95569b)
- build: use lint-staged in precommit hook (Linked Issues: f502dab48322dfe7b72c3ff6bd75acbf99a08422)

### ⚙️ CI

- ci: exclude test data from sonar rules (Linked Issues: f4479738d462909e3b3be0b5d93adb4f3a8de606)

### 🧪 Tests

- test: update db manager (Linked Issues: 4279107799ef38fbb381bf0574d43c8b9c364272)
- test: update collection names (Linked Issues: d74be5d41ab7ef032494074f6f006383311c5eb2)
- test: add unit test for getReportByMessageId (Linked Issues: 8855b2683bcb173efaac14452dc6e551a44f5d51)
- test: fix coverage and open handle (Linked Issues: 02ab78452fc90233b9dd723665f0ff588c9c067f)

### 📝 Other Changes

- Merge pull request #122 from frmscoe/rule-cfg (Linked Issues: 1911a50a73e63937d15b5cb9b4c6ef28757cef61)
- Add dependabot.yml file (#108) (Linked Issues: 2062d10ba2ae346e4058984fb3f8441b8dc0d32e)
- Merge pull request #116 from frmscoe/data-structure-fix (Linked Issues: 75be1021b2ee5e44cb8feeddb4c15114fd086155)
- Merge branch 'dev' of https://github.com/frmscoe/frms-coe-lib into data-structure-fix (Linked Issues: 18cf9e7e7a6326991f6e57e932c4ebad18cda1a3)
- Merge pull request #112 from frmscoe/remove-json-schema (Linked Issues: a6cf118e2d913fbeb8fffd5b3d02914c8284bf90)
- Merge pull request #106 from frmscoe/ossf-scorecard-workflow (Linked Issues: 0a3c832282377773bef868cf886b9895102e10e6)
- tests: redis lint change (Linked Issues: db7d37b92689e20016b17c284ea7dc178f0cf248)
- Add license header (Linked Issues: ea4d13dab28c8ab3f492f63ca64086b018b760ef)
- Create scorecard.yml (Linked Issues: 9667176c1d434d329ec046097a306e5a7fb01066)
- Merge pull request #99 from frmscoe/license-header (Linked Issues: e143ffd1f23dbabce1eef3173264e4d440dd65e5)
- Merge pull request #95 from frmscoe/feat/remove-channels (Linked Issues: e4c8c57d4a8dabf8be8f610a57c4c9d72f854203)
- 4.0.0-rc.5 (Linked Issues: 2e23cf7393aa52a675487a2439112fc7697e5de4)
- 4.0.0-rc.4 (Linked Issues: eea6bb3598e995384db1ff65d7ad39d3189e5864)
- 4.0.0-rc.3 (Linked Issues: 55c36c8f9ed3f307abb236879d1e055936b44d07)
- chore(docs): add examples/purpose for env vars (Linked Issues: 6f6a8f7d4a7103f2257ef9d21a42bfde1eddba69)
- 4.0.0-rc.2 (Linked Issues: 3a6baa3548a82647d4c51d6b25fa9f8df1bf8aa7)
- 4.0.0-rc.1 (Linked Issues: 7a5be0448a3c6ae482cd7843a0978896d4724618)
- 4.0.0-rc.0 (Linked Issues: 0c65632d1d09169bbc6200a9686148e3fe2ce856)
