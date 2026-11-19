"""Focused writer regressions; no placement search or artist-file writes.

python -B design/studio-v2/scene-coordination/m4-v03-verifier-v3-tests.py
python -B design/studio-v2/scene-coordination/m4-v03-verifier-v3-tests.py --write
--write exclusively creates the fresh receipt and refuses an existing receipt.
Fixture declarations are narrow test expectations, never an approved candidate
manifest. The unchanged actual v03 is deliberately rejected.
"""
import ast
import copy
import hashlib
import importlib.util
import json
import math
from pathlib import Path
import platform
import sys
import time
import traceback

import numpy as np

HERE = Path(__file__).resolve().parent
STUDIO = HERE.parent
OUT = HERE / 'm4-v03-verifier-v3-tests.json'
HELPER = STUDIO / 'asset-pipeline/full-kit/source/build_fullkit_m4_geometry_v03.py'
OLD_PINS = {
    'scene-coordination/m4-v03-cpu-verification.py': '11b1356d5afcfe9260b2e28e22b498279d1c33450aa5f4a82e9319fa324f5dd6',
    'scene-coordination/m4-v03-cpu-verification.json': 'c0fcce453614ff08e0facb5517fb4ed6fc430217ac455a2bbcf1e6dd325b6927',
    'scene-m4-v03-cpu-verification.md': '815edfabfb41fde8c3cd21e4a9429c1cf8be6d33f1a16ae2e008a23f5f2af174',
}
INTERFACE_SHA = '5632ca4a42214edc89776c05f6b8f80835c22ddc8fcbeb0429ea3c39f2670e97'
PROTECTED_PINS = {'asset-pipeline/full-kit/asset-inventory.json': 'eddc33b5a1c4b05184745c70ac71d25cb37bef295638f0b3ecaaa440a4001c87',
 'asset-pipeline/full-kit/export-ledger-v01.json': '26b4c143f64f6880f012c316e81f124fe899b69312b61866531e6bf884320775',
 'asset-pipeline/full-kit/exports/studio-full-kit-m3-proposal-v03.glb': 'dc9c6a78a704880db92678908bf7171329f6a80c86b96e2143e44e85e3f36baf',
 'asset-pipeline/full-kit/exports/studio-full-kit-m4-proposal-v01.raw-export.glb': 'c10e6453b6bee5c1cf09b3d1c905151a4567e5360116a0495bc1398eb20f5906',
 'asset-pipeline/full-kit/exports/studio-full-kit-m4-proposal-v02.glb': 'baa1a43bd343359edb217fa077bde0678a931cc3ed3991d5ee059e04813ed32f',
 'asset-pipeline/full-kit/full-kit-profile-v1.json': '7d2892ae7cb376b1b11942f956647e48284549e718f125b94bd57e5900d7a052',
 'asset-pipeline/full-kit/m4-author-report.md': '93d7c5c124a846240173b0a04fed1dffd4fb9743e15971d3ea41a966feb3ee79',
 'asset-pipeline/full-kit/manifests/m4-v01-tier-ledger.json': '63848642fde09d4d5762c9c5054129c22df51f0838bcc8f1b7c450fd80ffae63',
 'asset-pipeline/full-kit/manifests/m4-v03-cpu-preparation.json': 'd7196145a8665abefdf41b3235f3be8ec91aa7474b3c71fed2186d7537e20253',
 'asset-pipeline/full-kit/manifests/studio-full-kit-m3-proposal-v03.manifest.json': '060bab9af5dd23b4258e03aef10de21faa7c32aa0a6010cd4e09b35089026405',
 'asset-pipeline/full-kit/manifests/studio-full-kit-m4-proposal-v02.manifest.json': '42597f1b859fdae354063e09ee925d4d2dc9be8ae0ac8556663e391db6906b82',
 'asset-pipeline/full-kit/source/build_fullkit_m4.py': 'aa9724dcd14dbc428ca5c2ba84cffdcbb469fa14c53cf3866ac46164ec04dc22',
 'asset-pipeline/full-kit/source/build_fullkit_m4_geometry.py': 'c7ce9d8e1792273d6aeffdc5b536233413fdca6c6fd16abf344827d6433ab1c0',
 'asset-pipeline/full-kit/source/build_fullkit_m4_geometry_v03.py': '3b220b1d4614a8111247270b21771c5f2280493c16e3ab986603a24efcffaf37',
 'asset-pipeline/full-kit/source/build_fullkit_m4_v03.py': '53fa310f1144c46916b0ce63f05188818861e63fe9c32abbf4fb3f1596872b84',
 'asset-pipeline/full-kit/source/fk-40-music-proposal-v01.blend': '0ae40460b9a2cb578fc35a96497a9016e5f116a1efe98cac4809568fd68c4665',
 'asset-pipeline/full-kit/source/measure_fullkit_m4_v03.py': '9a3a098195e99b889ecee8b2213c9acc6a9dc50af68e1ae35e507e09b1b0bff5',
 'asset-pipeline/full-kit/source/render_m4_v01_evidence.py': 'bfa6fc9bf22707dc08f44f0bd4a7033e3817d54d2d142d5dea7a969fca161e18',
 'scene-coordination/m4-model-contract.json': '8f0474aad063a2517b0b399bb87728d823ddf5539ae12b67db60bdd7ae3f2d98',
 'scene-coordination/m4-transition-guard.py': 'ad62627f0683806ace2c8ebbb133ba83e72c7d95f1df8adc291a3706aa40da6b',
 'scene-coordination/m4-v03-art-closure-interrupted-20261115/partial-evidence.json': '8322d1cd0b11cd27af16ac9dfc990b6e279639469f263fb15cc4de98451bf307',
 'scene-coordination/m4-v03-art-closure-interrupted-20261115/partial-report.md': 'c0f673655f2daa99adea3019935e1294ef098927b1ac307d83a128f692cac207',
 'scene-coordination/m4-v03-art-closure-interrupted-20261115/snapshot-manifest.json': '483c601a7c470d0a81221f780048568bb9e6dd41b7df1675fa5d16e462282b68',
 'scene-coordination/m4-v03-art-review-interruption.md': '7f78ad65ecb95584211bdd79c7a6ee734349f4eabff4982258b2d73b2bebf1b0',
 'scene-coordination/m4-v03-cpu-verification.json': 'c0fcce453614ff08e0facb5517fb4ed6fc430217ac455a2bbcf1e6dd325b6927',
 'scene-coordination/m4-v03-cpu-verification.py': '11b1356d5afcfe9260b2e28e22b498279d1c33450aa5f4a82e9319fa324f5dd6',
 'scene-coordination/m4-v03-focused-art-closure-task.md': '614e8acb0aa03f6fdf41d17dcb91b8c664c9ae63d1e46a80de1ef3c1081492e4',
 'scene-coordination/m4-v03-normal-check-contract-review.md': 'cc7812bd57027365bb6e61064eabea6564c7c20aa7eec8c2f9d3b8e07312a3fc',
 'scene-m4-v03-cpu-verification.md': '815edfabfb41fde8c3cd21e4a9429c1cf8be6d33f1a16ae2e008a23f5f2af174',
 'scene-m4-v03-preparation-report.md': 'b21b6f2b7b6b97786b4da8a34d59b114e2daf6fe5ffb5ae7d49c4117ecc3abc3',
 'scene-coordination/m4-v03-verifier-v2.py': '12658d50605c9bc7fe625151adf05a8b9faa993c4f378cc99a502402ebf24710',
 'scene-coordination/m4-v03-verifier-v2-tests.py': 'af71947a0647259ce22eed99a17193f3f8072f63bad3f494a0341d53b7aea00a',
 'scene-coordination/m4-v03-verifier-v2-tests.json': '31648785e1d4fa93b1a16daa9f941af0de8418d4eefe74db0d3fecc41899246c',
 'scene-coordination/m4-v03-verifier-declaration-contract.json': '71eb54107e54ae94856ea3461471a1afe3e3a27b7de97bfe5a331fe91c8e5293',
 'scene-m4-v03-verification-repair-report.md': '6f1088bcf5691de641c55e959fdb7290bbcc310fc99bbf64a410be337c92209d',
 'scene-coordination/m4-v03-verifier-contract-review.md': '7f5f6340960ab3aabf4d107577b6702f36d205257b73fa88de59bdbfd8a94e35',
 'scene-coordination/m4-v03-verifier-binding-task.md': '4eff478f63355ff551fa9f72e9bb86a5d988a020c5f80ba95ea2750b8eb27c16',
 'scene-coordination/m4-v03-verifier-binding-disposition.md': '4ac02bc7a2ec2f09f38545270b9ff47c7c1e43d08d032ba5a8fdf79597800acd'}
LIVE_REVIEW_PATHS = ['scene-coordination/m4-v03-focused-art-closure.json', 'scene-m4-v03-focused-art-closure.md']
# Literal fixture expectations frozen BEFORE verification runs, never refreshed by call().
FROZEN_FIXTURES = {'actual_frozen_v03_support_scope_rejects_both_confirmed_spurs': {'rowsSha256': '1a7d5ebd17fb8c2db22df6a7eb17eae061f22aaf637d7a2f4ab36ed8e212c6c5',
                                                                  'declarationSha256': 'ea089aa99a86ca9de048414a61cdb8c681075af523f1edb66adf43305470de9c'},
 'narrow_actual_23_ordinary_supports_positive': {'rowsSha256': 'e82d890a9fe17929cff31b31db23efcc5788c8639b379b55b274887295f6836d',
                                                 'declarationSha256': '79baf5737f3ff8ce91464f95eb25c420dcbf3b7ba79c51ad68df72242d6f37af'},
 'actual_rack_foot_lift_5mm_cannot_hide_behind_row_minimum': {'rowsSha256': '16d02a448812268cff045f30a6024f11f75a120a9009b7ba15b247f6e7d6dd08',
                                                              'declarationSha256': '8f9335c646e5b01066d49c8033c4126428eb210ac7063611727fe18d9950f76a'},
 'actual_rack_foot_penetration_1mm_rejects': {'rowsSha256': '4d2980176c2d0cf466589a6100e35464a21f3fe0a9aebd26d0afa54b74d317ea',
                                              'declarationSha256': 'd0637bf2730a5261589b17bdd99a4a349bdd2b2eb5c6d66baabc820b0b51884e'},
 'missing_expected_support_identity_rejects': {'rowsSha256': 'e82d890a9fe17929cff31b31db23efcc5788c8639b379b55b274887295f6836d',
                                               'declarationSha256': '79baf5737f3ff8ce91464f95eb25c420dcbf3b7ba79c51ad68df72242d6f37af'},
 'unknown_support_identity_rejects': {'rowsSha256': 'e82d890a9fe17929cff31b31db23efcc5788c8639b379b55b274887295f6836d',
                                      'declarationSha256': '79baf5737f3ff8ce91464f95eb25c420dcbf3b7ba79c51ad68df72242d6f37af'},
 'duplicate_support_id_even_in_pinned_fixture_rejects': {'rowsSha256': 'e82d890a9fe17929cff31b31db23efcc5788c8639b379b55b274887295f6836d',
                                                         'declarationSha256': 'd1772d19928118e4e5e8554cb3ea059af26cc1f27f85f00dc84acc7ac7232dd3'},
 'different_ids_cannot_cover_same_primitive_twice': {'rowsSha256': 'e82d890a9fe17929cff31b31db23efcc5788c8639b379b55b274887295f6836d',
                                                     'declarationSha256': 'b2583f9c34d9e6ad2d1f037887f88d9cc71ae1407110a9c9a3e8060ac0a22e12'},
 'unknown_support_primitive_rejects': {'rowsSha256': 'e82d890a9fe17929cff31b31db23efcc5788c8639b379b55b274887295f6836d',
                                       'declarationSha256': '7e0bcbaf75a6bd3f342f6755e4ca809c285a70d1806069328ceca9b91730be36'},
 'missing_explicit_surface_rejects': {'rowsSha256': 'e82d890a9fe17929cff31b31db23efcc5788c8639b379b55b274887295f6836d',
                                      'declarationSha256': '51af470531ccfadcac20a8e162c5c38eb0df0fb26527383115ae52cd95a33fe3'},
 'mixed_rug_floor_supports_in_one_row_reject': {'rowsSha256': 'e82d890a9fe17929cff31b31db23efcc5788c8639b379b55b274887295f6836d',
                                                'declarationSha256': '470d1e8a925afa263a28acca919c6acfa644b27333923edcfe10289adcae0fd1'},
 'actual_source_byte_mismatch_rejects': {'rowsSha256': 'e82d890a9fe17929cff31b31db23efcc5788c8639b379b55b274887295f6836d',
                                         'declarationSha256': '79baf5737f3ff8ce91464f95eb25c420dcbf3b7ba79c51ad68df72242d6f37af'},
 'bare_floor_actual_outline_and_signed_height_api_positive': {'rowsSha256': '078fa47fe0c122083999653d3c9146b47794cfe374c983a22dbb9c577b670fd1',
                                                              'declarationSha256': '52726e1d225d1cc8b41fbff9934eb7b6f9a55624b5d52df171b1c637ee8eeac0'},
 'finite_input_derived_overflow_rejects_JSON_safely': {'rowsSha256': '94466639b06747a4a4d01879312c58adb88bdd79482b2e1dce0645609384e24a',
                                                       'declarationSha256': '57440c6d7a3349bde50890ad873de33f09a1ea6d7fc26af775266eed22e12740'},
 'nonhorizontal_receiver_rejects': {'rowsSha256': '38a8d9e908a54475a17e3b9e93397dd7da8e5b169fbec86216bb3f92026c80ea',
                                    'declarationSha256': '19f9c3849c913682fe076ee6988e93ac6770c8e92ff9e066c90fd916a9cd760a'},
 'crossed_receiver_boundary_rejects': {'rowsSha256': 'f995a1cdf509182a202f85620bfae42dda0bdbec79e8e714d175b413c436eeac',
                                       'declarationSha256': 'e72eff1e94b9d096cbfbc6a125cc9db229d78f9a9925d86770491c221ab8372a'},
 'actual_authored_slab_classes_and_normals_positive': {'rowsSha256': 'c29860fc9682ebcd7e7b47793b3f255e698ba5d8e76cee55ae5b02ccd9c8480a',
                                                       'declarationSha256': 'adba2da9da6ad4e96ef5ec12abbf785526348d776b71433812a393450251f0b8'},
 'same_topology_vertex_substitution_frozen_pins_rejects': {'rowsSha256': 'c29860fc9682ebcd7e7b47793b3f255e698ba5d8e76cee55ae5b02ccd9c8480a',
                                                           'declarationSha256': 'adba2da9da6ad4e96ef5ec12abbf785526348d776b71433812a393450251f0b8'},
 'same_topology_corner_normal_substitution_frozen_pins_rejects': {'rowsSha256': 'c29860fc9682ebcd7e7b47793b3f255e698ba5d8e76cee55ae5b02ccd9c8480a',
                                                                  'declarationSha256': 'adba2da9da6ad4e96ef5ec12abbf785526348d776b71433812a393450251f0b8'},
 'actual_planar_corner_tilt_3deg_rejects': {'rowsSha256': '1479a46094884fb6853be29c788e762e364091efe3a398b838f3bcb888e3810c',
                                            'declarationSha256': 'ce8514fc62b9f53cfb3e907967a6ce80a845a6b37d2985ba56fd10758e5e11df'},
 'actual_planar_corner_tilt_below_2deg_positive': {'rowsSha256': '406bd16118edf3932842560c472784f5a2a85b680f0d0ac5c78c6d9405863c39',
                                                   'declarationSha256': '1311bdb19c90c8a1d5862b3142ec911586a47fbf0d8dd590af898c34a35fb847'},
 'flipped_planar_normal_rejects_without_abs_dot': {'rowsSha256': '7f9ed1d79c0b0f4c065727215c5e1339cfa1c1d8a7a26e5dc769685645a087ba',
                                                   'declarationSha256': '523b6e0f96aa456b6275eb7e4de392c950fae2df9e0b252343a36a7da16e93ec'},
 'actual_degenerate_planar_triangle_rejects': {'rowsSha256': '42bb7ced08761cea550622063e8395cbb3922bdb6d6d575e69cc36a340093a93',
                                               'declarationSha256': 'f9ca3b8efa1a3ff23367a42e05723955e3671bbdd519026afe8c4500a7725e33'},
 'nonfinite_normal_payload_rejects_at_finite_encoding': {'rowsSha256': 'c29860fc9682ebcd7e7b47793b3f255e698ba5d8e76cee55ae5b02ccd9c8480a',
                                                         'declarationSha256': 'adba2da9da6ad4e96ef5ec12abbf785526348d776b71433812a393450251f0b8'},
 'nonunit_normal_rejects': {'rowsSha256': '0e8417b6cabb9b709494458c98654677ccd8b37d4c58fd4a27d6a93e6bd85b7f',
                            'declarationSha256': '989dcdf582923c6af4b6882d1ab85bcf507d891102f9273cf608776eadfa30c7'},
 'zero_normal_rejects': {'rowsSha256': 'e066770240065c3b1cd95446046ba58832bfccca58a1adb274451e17bb45e0a6',
                         'declarationSha256': '0fb377e9eaffaaf985ca7b0418dfb67c97fb5f6bcc83d0202be80330b0b2c5ac'},
 'missing_corner_normals_rejects': {'rowsSha256': 'b55fd3fc70a5ec3f5a7221b340c080660765c931534f5f629895858c2f89dad5',
                                    'declarationSha256': '61d8591034f40ebad81b613fdd78404128f641c4414a7bc0f8557600fdd3766d'},
 'null_face_class_rejects': {'rowsSha256': '3b60982db0e657d3bb4a65cb7910a5ea1f464cd3f9eb329ad34d4615248d6c93',
                             'declarationSha256': '9481a7f3d1243b88fff1bc9e360ec1a527428fd6d3c20de82cc0b58f3e752d58'},
 'missing_face_class_rejects': {'rowsSha256': '179eb651fd1ea6d264f48dc972f9140c646503e08eb5f4a06a4d6838dfde6c7b',
                                'declarationSha256': '43a4545bb5cb7916d028b3ea037d3c1c29bf409149fb4de6e4c962cb97e6305a'},
 'unknown_face_class_rejects': {'rowsSha256': 'feb4e483909a4b73afb7215de40fa4c3c86934f8b241b1b4b1db531ecca7e17a',
                                'declarationSha256': '4ba246d07a2ceb6d227483db3a5b590965f18d096d5e1d64f45d59382ca71a3f'},
 'planar_to_bevel_reclassification_rejects': {'rowsSha256': '35fe8cbead43d926402270108795f6a5cca505a258a1055acf5fc8d36f059d78',
                                              'declarationSha256': '8a5618e39541cb27a271597f1d1535008f12c7bf8a8b99bcd453093095a099a5'},
 'missing_group_rejects': {'rowsSha256': '6b9fe181a6e5b30eae45085c6522a5db4fd2a9ff2a542fe8cd98fa1eb4defcde',
                           'declarationSha256': '5c388ba17273fd87aa3e42a0c78eebad6293670f9c92a00ca4f222d9ec87693b'},
 'duplicate_group_identity_rejects': {'rowsSha256': '7f84bfa24e40c8a0f1d245dea1ee8dc11272ce2c4f347445bf4d737dffc6126e',
                                      'declarationSha256': 'f7559446518a9fd8c8995c89ee0ae56335fdebf53bd9cd6a019040c6376db424'},
 'unknown_group_rejects': {'rowsSha256': '6aa8fbe8d54e573e163b745671128de5e77dd29c1e103406fcc92ed698032dbf',
                           'declarationSha256': '0198893abc89890818ca4c38753cb20cf5d45d2e94903d925b3463f923586630'},
 'changed_group_range_rejects': {'rowsSha256': '0a5e4712db01fea7eb1080f0dd4d5e5fa63c7dc19fa82bf2441e022da3c4c566',
                                 'declarationSha256': 'c339bc78680a8b6c86a786f71db969cfa7dc80e5e25909aaf63af251877a67a4'},
 'overlapping_group_ranges_even_in_pinned_fixture_reject': {'rowsSha256': '184adca79f126750649e35f144d50f1950a6f6c53633c91d5f3e3c5ac893017f',
                                                            'declarationSha256': '610ec05935d5199838f11ad4624801cab02bb688038089c0d329ee9f2fbda184'},
 'inconsistent_expected_triangle_count_rejects': {'rowsSha256': 'd3a9616cd36cba902b1a83c024ac942b354c18f305d4645f5f77cf01cae8c6e0',
                                                  'declarationSha256': '00536b511b0761e31d7c88ac5d1032b122177f6922c9f037d9ab5eed18c15c8e'},
 'long_smooth_bevel_positive_despite_large_area': {'rowsSha256': 'b6acf80e04860bf8a95b4a7b000b6900900ab6ef716c84d30de3f6022cc0fdb2',
                                                   'declarationSha256': 'f38d403dec829de79682dbb54e1c8156768fff454bd74d6a6fb4556709ded07d'},
 'same_long_strip_forced_planar_is_negative_control': {'rowsSha256': '7cd8309697ef7a0022c13a3fff6ecdd5b19b9aed0923f39343f4c7773c54a3ea',
                                                       'declarationSha256': 'dd4720beeb925e812f76cc2018989f10b4dfd3edebe053a32021ce519c8bfff3'},
 'tiny_planar_triangle_is_tested_regardless_of_area': {'rowsSha256': '7046b78cf1413d58a44e898c3e173254ceefdc16741e20f17e8f7a7a158967af',
                                                       'declarationSha256': '2c906be69d72695a733d66c6dcd5798f39a5af788bd6854cffc2781b68569184'},
 'malformed_null_groups_fails_closed': {'rowsSha256': '42fd9354f51676c37ff0dc5a8f077b16c762347231c88311fff431c0b70a953e',
                                        'declarationSha256': 'c49a95a201e1dcde40733172ab71b76dc6aef19bdf6b083c76094d12062dabdf'},
 'malformed_null_faces_fails_closed': {'rowsSha256': 'a2dbf38305117dff5b15806db135478220d15625f23adc00743c009e768dc76d',
                                       'declarationSha256': '4693aee4c8ce657194958fa76d32e246ce679c1d40b7b03d3015755762624a39'},
 'malformed_null_vertices_fails_closed': {'rowsSha256': '098d5400b567e88d1cbce6a3075acd1b651f544b51ee0c499576b778a1231e2b',
                                          'declarationSha256': 'd33d35161291297fdbc554b4bd13f6f1207bb5cf4261e1210293cb0c1f5faba6'},
 'malformed_null_faceClasses_fails_closed': {'rowsSha256': 'e2955904a5c98789d1e1dabe5be11f2f6a9e533b2a5375efc93c372883087544',
                                             'declarationSha256': '23660b47b8b7b0f4bd71a747ff9b17c1a6230069d02a07c98346b7c958bb663f'},
 'null_rows_pin_rejects': {'rowsSha256': 'c29860fc9682ebcd7e7b47793b3f255e698ba5d8e76cee55ae5b02ccd9c8480a',
                           'declarationSha256': 'b7523486a4c655c8bffaa924c6fce53133671a4afc8f145ee1625f4e757bc89f'},
 'malformed_rows_pin_rejects': {'rowsSha256': 'c29860fc9682ebcd7e7b47793b3f255e698ba5d8e76cee55ae5b02ccd9c8480a',
                                'declarationSha256': '537c4d28a13da8f5ed9ea87b6b3d8dc26b4fbe6dcda160fecb851f9965eb3825'},
 'caller_cannot_change_rows_pin_under_frozen_declaration': {'rowsSha256': 'c29860fc9682ebcd7e7b47793b3f255e698ba5d8e76cee55ae5b02ccd9c8480a',
                                                            'declarationSha256': 'adba2da9da6ad4e96ef5ec12abbf785526348d776b71433812a393450251f0b8'}}
FROZEN_MISSING_ROWS_DECLARATION = '8b5b2e63a354807d71f4436d5d665502172c398c48d77e2e3a8bbf1594449e99'
CURRENT_TEST = None
SUPPORT_GROUPS = {
    'ctl_stand__frame': [3, 4, 5, 9, 10, 11],
    'ctl_sustain_pedal__pedal': [0],
    'stool_keys__stool': [5, 7, 9, 11],
    'drum_rack__rack': [1, 2, 3, 16, 17, 18],
    'drum_kick__tower': [1, 6, 2, 3],  # confirmed support spurs are NOT omitted
    'drum_hihat_pedal__pedal': [0],
    'drum_throne__throne': [6, 9, 12],
}


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def load(path, name):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def protected_hashes():
    actual = {rel: digest(STUDIO / rel) for rel in PROTECTED_PINS}
    assert actual == PROTECTED_PINS, 'Immutable protected files differ from frozen baseline'
    return actual


def live_review_hashes():
    # Independently owned live pair may change under root's explicit continuation.
    return {rel: digest(STUDIO / rel) for rel in LIVE_REVIEW_PATHS}


def snapshot(part, indices, *, normal_scope=False, authored_normals=None):
    """Explicitly scoped primitive selection, preserving source class meaning.

    Position-only support fixtures explicitly make no N1 claim. Normal fixtures
    select a fully classified authored primitive, never convert unknown artistic
    surfaces to bevel/round or construct a complete candidate declaration.
    """
    V, F, classes, groups, normals = [], [], [], [], []
    for gi in indices:
        label, v0, v1, f0, f1 = part.groups[gi]
        vb, fb = len(V), len(F)
        V.extend([[float(x) for x in p] for p in part.v[v0:v1]])
        for fi in range(f0, f1):
            face = part.f[fi][0]
            F.append([v-v0+vb for v in face])
            classes.append(part.cls[fi] if normal_scope else 'out_of_scope')
            if normal_scope:
                assert part.cls[fi] is not None, 'Test scope must have actual authored classes'
                normals.append([[float(x) for x in authored_normals[(fi, v)]] for v in face])
        groups.append({'id': f'{part.row}/primitive/{gi}', 'vertexRange': [vb, len(V)], 'faceRange': [fb, len(F)],
                       'triangleCount': sum(len(face)-2 for face in F[fb:]),
                       'n1': 'in_scope' if normal_scope else 'out_of_scope',
                       'reason': f'Fixture only: actual authored {label} primitive {gi}; '+
                                 ('original explicit N1 classes' if normal_scope else 'support/receiver positions only; no N1 assertion')})
    row = {'vertices': V, 'faces': F, 'faceClasses': classes, 'groups': groups}
    if normal_scope:
        row['cornerNormals'] = normals
    return row


def declaration(rows, sources, supports=None, surfaces=None):
    return {'schema': 'm4-source-declaration/3', 'scope': 'fixture',
            'sources': {k: hashlib.sha256(v).hexdigest() for k, v in sources.items()},
            'rows': [{'id': row, 'vertexCount': len(r['vertices']), 'faceCount': len(r['faces']),
                      'normalsRequired': 'cornerNormals' in r, 'groups': copy.deepcopy(r['groups']),
                      'faceClasses': list(r['faceClasses'])} for row, r in rows.items()],
            'surfaces': copy.deepcopy(surfaces or []), 'supports': copy.deepcopy(supports or [])}


def expected_pin(name):
    return FROZEN_FIXTURES[name]['declarationSha256']


def call(V, rows, decl, sources, pin=None):
    # This is a fixture assembly adapter, not a production candidate caller.
    # Both expected values are literal separately frozen test data; no live hash
    # is promoted to an expectation, including for deliberate invalid fixtures.
    frozen = FROZEN_FIXTURES[CURRENT_TEST]
    bound = copy.deepcopy(decl)
    bound.setdefault('rowsSha256', frozen['rowsSha256'])
    result = V.audit_m4_v3(rows, bound,
                         expected_declaration_sha256=pin if pin is not None else frozen['declarationSha256'],
                         source_bytes=sources)
    return result


def check_result(result, valid, section=None, code=None):
    assert result['valid'] is valid, result
    assert result['candidateAcceptance'] is False
    if section:
        assert result[section]['valid'] is False, result
        if section != 'coverage':
            assert result['coverage']['valid'] is True, result
            assert result[section]['status'] == 'checked', result
    if code:
        assert any(e['code'] == code for e in result[section]['errors']), result
    json.dumps(result, allow_nan=False)
    return result


def summary(result):
    if 'coverage' not in result:
        return result
    return {'valid': result['valid'], 'scope': result['scope'], 'candidateAcceptance': result['candidateAcceptance'],
            'coverage': result['coverage'], 'supportErrors': result['supportGeometry']['errors'],
            'normalErrors': result['normalValidity']['errors'],
            'supportCount': len(result['supportGeometry']['supports']), 'normalRows': result['normalValidity']['rows'],
            'payloadAssociationControl': result.get('payloadAssociationControl')}


def synthetic_row(vertices, faces, classes, normals=None):
    group = {'id': 'synthetic-primitive', 'vertexRange': [0, len(vertices)], 'faceRange': [0, len(faces)],
             'triangleCount': sum(len(f)-2 for f in faces), 'n1': 'in_scope' if normals is not None else 'out_of_scope',
             'reason': 'Synthetic verifier fixture only, not an artistic candidate declaration'}
    row = {'vertices': vertices, 'faces': faces, 'groups': [group], 'faceClasses': classes}
    if normals is not None:
        row['cornerNormals'] = normals
    return row


def run():
    if '--write' in sys.argv and OUT.exists():
        raise SystemExit('Refusing to overwrite existing exclusive receipt')
    start = time.monotonic()
    before = protected_hashes()
    live_before = live_review_hashes()
    interface = HERE / 'm4-v03-verifier-declaration-contract-v3.json'
    assert digest(interface) == INTERFACE_SHA
    V = load(HERE / 'm4-v03-verifier-v3.py', 'm4_verifier_v3')
    G = load(HELPER, 'm4_source_geometry_fixture')
    parts, _ = G.build_all()  # One cheap geometry build; no measurement/search import.
    sources = {'frozen-helper': HELPER.read_bytes()}
    tests, failures, evidence = [], [], {}

    def test(name, action):
        global CURRENT_TEST
        CURRENT_TEST = name
        try:
            result = action()
            tests.append({'name': name, 'passed': True, 'evidence': summary(result)})
            return result
        except Exception:
            failure = {'name': name, 'passed': False, 'traceback': traceback.format_exc()}
            failures.append(failure); tests.append(failure)
            return None

    support_rows = {row: snapshot(parts[row], groups) for row, groups in SUPPORT_GROUPS.items()}
    support_rows['rug__rug'] = snapshot(parts['rug__rug'], [0])
    surfaces = [{'id': 'rug-field', 'kind': 'rug_field', 'boundaryRow': 'rug__rug', 'boundaryFace': len(parts['rug__rug'].f)-1},
                {'id': 'bare-floor', 'kind': 'bare_floor', 'boundaryRow': 'rug__rug', 'boundaryFace': len(parts['rug__rug'].f)-2}]
    supports = [{'id': f'{row}/support/{gi}', 'row': row, 'group': f'{row}/primitive/{gi}', 'surface': 'rug-field'}
                for row, groups in SUPPORT_GROUPS.items() for gi in groups]
    full_support_decl = declaration(support_rows, sources, supports, surfaces)
    base = test('actual_frozen_v03_support_scope_rejects_both_confirmed_spurs', lambda:
                check_result(call(V, support_rows, full_support_decl, sources), False, 'supportGeometry', 'liftedSupport'))
    if base:
        errors = base['supportGeometry']['errors']
        assert len(errors) == 2 and {e['location'] for e in errors} == {'drum_kick__tower/support/2', 'drum_kick__tower/support/3'}
        assert all(abs(e['signedGapErrorM']-.005025064731369289) < 1e-12 for e in errors)
        evidence['actualSupportFailure'] = base
    test('actual_v03_without_author_declaration_fails_closed', lambda:
         check_result(V.audit_m4_v3(support_rows, None, expected_declaration_sha256=None, source_bytes=sources),
                      False, 'coverage', 'missingDeclaration'))
    # A separate explicitly narrow positive fixture contains only the 23 known
    # ordinary primitives; the two confirmed defects remain in the test above.
    good_groups = copy.deepcopy(SUPPORT_GROUPS); good_groups['drum_kick__tower'] = [1, 6]
    good_rows = {row: snapshot(parts[row], gs) for row, gs in good_groups.items()}
    good_rows['rug__rug'] = support_rows['rug__rug']
    good_supports = [s for s in supports if s['id'] not in ('drum_kick__tower/support/2', 'drum_kick__tower/support/3')]
    good_decl = declaration(good_rows, sources, good_supports, surfaces)
    evidence['ordinarySupportPositive'] = test('narrow_actual_23_ordinary_supports_positive', lambda:
         check_result(call(V, good_rows, good_decl, sources), True))
    baseline_copy = copy.deepcopy(good_rows)
    baseline_decl = copy.deepcopy(good_decl)

    def move_rack(dz):
        rows = copy.deepcopy(good_rows)
        g = next(g for g in rows['drum_rack__rack']['groups'] if g['id'].endswith('/2'))
        for vi in range(*g['vertexRange']):
            rows['drum_rack__rack']['vertices'][vi][2] += dz
        return check_result(call(V, rows, good_decl, sources), False, 'supportGeometry', 'liftedSupport' if dz > 0 else 'penetratingSupport')
    test('actual_rack_foot_lift_5mm_cannot_hide_behind_row_minimum', lambda: move_rack(.005))
    test('actual_rack_foot_penetration_1mm_rejects', lambda: move_rack(-.001))

    def mutate_decl(fn, *, repin=False, code='declarationPinMismatch'):
        d = copy.deepcopy(good_decl); fn(d)
        return check_result(call(V, good_rows, d, sources, None if repin else expected_pin('narrow_actual_23_ordinary_supports_positive')), False, 'coverage', code)
    test('missing_expected_support_identity_rejects', lambda: mutate_decl(lambda d: d['supports'].pop()))
    test('unknown_support_identity_rejects', lambda: mutate_decl(lambda d: d['supports'][0].update(id='unknown-contact')))
    test('duplicate_support_id_even_in_pinned_fixture_rejects', lambda:
         mutate_decl(lambda d: d['supports'].append(copy.deepcopy(d['supports'][0])), repin=True, code='duplicateIdentity'))
    test('different_ids_cannot_cover_same_primitive_twice', lambda:
         mutate_decl(lambda d: d['supports'].append(d['supports'][0] | {'id': 'second-name-same-foot'}), repin=True, code='duplicateSupportPrimitive'))
    test('unknown_support_primitive_rejects', lambda:
         mutate_decl(lambda d: d['supports'][0].update(group='unknown-primitive'), repin=True, code='unknownSupportPrimitive'))
    test('missing_explicit_surface_rejects', lambda:
         mutate_decl(lambda d: d['supports'][0].pop('surface'), repin=True, code='missingOrUnknownReceivingSurface'))
    test('mixed_rug_floor_supports_in_one_row_reject', lambda:
         mutate_decl(lambda d: d['supports'][0].update(surface='bare-floor'), repin=True, code='mixedReceivingSurfaces'))
    test('missing_external_manifest_pin_rejects', lambda:
         check_result(V.audit_m4_v3(good_rows, good_decl, expected_declaration_sha256=None, source_bytes=sources), False, 'coverage', 'missingDeclarationPin'))
    test('actual_source_byte_mismatch_rejects', lambda:
         check_result(call(V, good_rows, good_decl, {'frozen-helper': sources['frozen-helper']+b'changed'}), False, 'coverage', 'sourcePinMismatch'))

    rug = parts['rug__rug']
    field = np.array(rug.v)[list(rug.f[-1][0])][:, :2]
    outline = np.array(rug.v)[list(rug.f[-2][0])][:, :2]
    def rounded():
        r = V.footprint_clearance([[.606, -1.314]], field, 'inside')
        assert abs(r['signedClearanceM']-.019318516525781364) < 1e-12 and r['signedClearanceM'] < .020
        return r | {'rectangleClaimM': .020, 'rejectedAtRequiredClearance': True}
    test('preserved_rounded_corner_20mm_false_positive_rejects', rounded)
    def clearance(points, side, valid):
        r = V.footprint_clearance(points, outline if side == 'outside' else field, side)
        assert (r['signedClearanceM'] >= .020) is valid
        return r
    test('bare_floor_disjoint_complete_footprint_positive', lambda: clearance([[2.25, .2], [2.30, .2], [2.30, .3], [2.25, .3]], 'outside', True))
    test('bare_floor_vertices_outside_but_edge_crosses_rug_rejects', lambda:
         clearance([[.3, -.1], [2.5, -.1], [2.5, .1], [.3, .1]], 'outside', False))
    test('bare_floor_footprint_enclosing_whole_rug_rejects', lambda:
         clearance([[.3, -1.6], [2.5, -1.6], [2.5, 1.1], [.3, 1.1]], 'outside', False))
    test('bare_floor_footprint_on_rug_rejects', lambda: clearance([[1, 0], [1.1, 0], [1.1, .1], [1, .1]], 'outside', False))
    test('rug_footprint_crosses_field_edge_rejects', lambda:
         clearance([[.3, -.1], [1, -.1], [1, .1], [.3, .1]], 'inside', False))

    # Whole API bare-floor control; footprint is clear of the actual outer rug.
    floor_rows = {'rug__rug': support_rows['rug__rug'], 'floor-fixture': synthetic_row(
        [[2.25,.2,.0003], [2.30,.2,.0003], [2.30,.3,.0003], [2.25,.3,.0003]], [[0,1,2,3]], ['out_of_scope'])}
    floor_decl = declaration(floor_rows, sources, [{'id':'floor-contact','row':'floor-fixture','group':'synthetic-primitive','surface':'bare-floor'}], surfaces)
    test('bare_floor_actual_outline_and_signed_height_api_positive', lambda: check_result(call(V, floor_rows, floor_decl, sources), True))
    def derived_overflow():
        rows = copy.deepcopy(floor_rows)
        # Use a rug receiver at a huge finite Z and a huge negative support Z.
        # This exercises receipt safety, not an admissible M4 placement.
        for vertex in rows['rug__rug']['vertices']:
            vertex[2] = 1e308
        for vertex in rows['floor-fixture']['vertices']:
            vertex[2] = -1e308
        d = copy.deepcopy(floor_decl); d['supports'][0]['surface'] = 'rug-field'
        return check_result(call(V, rows, d, sources), False, 'supportGeometry', 'nonFiniteDerivedMeasurement')
    test('finite_input_derived_overflow_rejects_JSON_safely', derived_overflow)
    def bad_boundary(kind):
        rows = copy.deepcopy(floor_rows)
        fi = surfaces[1]['boundaryFace']; vertex = rows['rug__rug']['faces'][fi][0]
        if kind == 'height':
            rows['rug__rug']['vertices'][vertex][2] += .01
        else:
            rows['rug__rug']['faces'][fi][1], rows['rug__rug']['faces'][fi][8] = rows['rug__rug']['faces'][fi][8], rows['rug__rug']['faces'][fi][1]
        return check_result(call(V, rows, floor_decl, sources), False, 'coverage',
                            'nonHorizontalReceivingBoundary' if kind == 'height' else 'nonConvexOrCrossedBoundary')
    test('nonhorizontal_receiver_rejects', lambda: bad_boundary('height'))
    test('crossed_receiver_boundary_rejects', lambda: bad_boundary('cross'))

    shell = parts['ctl_body__shell']; auth = G.corner_normals(shell)
    normal_rows = {'shell-slab-fixture': snapshot(shell, [0], normal_scope=True, authored_normals=auth)}
    normal_decl = declaration(normal_rows, sources)
    evidence['actualSlabNormalPositive'] = test('actual_authored_slab_classes_and_normals_positive', lambda:
         check_result(call(V, normal_rows, normal_decl, sources), True))
    def normal_mutation(fn, section, code):
        rows = copy.deepcopy(normal_rows); fn(rows['shell-slab-fixture'])
        return check_result(call(V, rows, normal_decl, sources), False, section, code)
    def tilt(r, angle):
        n = np.array(r['cornerNormals'][0][0]); axis = np.array([1.,0,0]) if abs(n[0]) < .9 else np.array([0.,1,0])
        t = np.cross(n,axis); t /= np.linalg.norm(t)
        r['cornerNormals'][0][0] = (n*math.cos(math.radians(angle))+t*math.sin(math.radians(angle))).tolist()
    test('actual_planar_corner_tilt_3deg_rejects', lambda: normal_mutation(lambda r: tilt(r,3), 'normalValidity','planarCornerAngle'))
    def angle_positive():
        rows = copy.deepcopy(normal_rows); tilt(rows['shell-slab-fixture'], 1.99)
        return check_result(call(V, rows, normal_decl, sources), True)
    test('actual_planar_corner_tilt_below_2deg_positive', angle_positive)
    test('flipped_planar_normal_rejects_without_abs_dot', lambda:
         normal_mutation(lambda r: r['cornerNormals'][0].__setitem__(0, (-np.array(r['cornerNormals'][0][0])).tolist()), 'normalValidity','planarCornerAngle'))
    test('actual_degenerate_planar_triangle_rejects', lambda:
         normal_mutation(lambda r: r['vertices'].__setitem__(r['faces'][0][2], r['vertices'][r['faces'][0][1]]), 'normalValidity','degenerateTriangle'))
    def nonfinite_normal_predicate():
        # Nonfinite values cannot have a finite payload pin; exercise the retained
        # normal predicate directly as well as the API encoding rejection below.
        specs, groups, arrays, supports_, surfaces_ = V.validate_coverage(
            normal_rows, dict(normal_decl, rowsSha256=FROZEN_FIXTURES['actual_authored_slab_classes_and_normals_positive']['rowsSha256']),
            expected_pin('actual_authored_slab_classes_and_normals_positive'), sources)
        rows = copy.deepcopy(normal_rows)
        rows['shell-slab-fixture']['cornerNormals'][0][0] = [math.nan, 0, 1]
        result = V.audit_normals(rows, specs, arrays)
        assert result['valid'] is False and any(e['code'] == 'invalidCornerNormal' for e in result['errors'])
        json.dumps(result, allow_nan=False)
        return {'directPredicate': 'normalValidity', **result}
    test('nonfinite_normal_rejects_JSON_safely', nonfinite_normal_predicate)
    test('nonfinite_normal_payload_rejects_at_finite_encoding', lambda:
         normal_mutation(lambda r: r['cornerNormals'][0].__setitem__(0, [math.nan,0,1]), 'coverage','invalidRowsEncoding'))
    test('nonunit_normal_rejects', lambda:
         normal_mutation(lambda r: r['cornerNormals'][0].__setitem__(0, [0,0,2]), 'normalValidity','invalidCornerNormal'))
    test('zero_normal_rejects', lambda:
         normal_mutation(lambda r: r['cornerNormals'][0].__setitem__(0, [0,0,0]), 'normalValidity','invalidCornerNormal'))
    test('missing_corner_normals_rejects', lambda:
         normal_mutation(lambda r: r.pop('cornerNormals'), 'normalValidity','missingOrInvalidCornerNormals'))
    test('null_face_class_rejects', lambda: normal_mutation(lambda r: r['faceClasses'].__setitem__(0,None), 'coverage','invalidClasses'))
    test('missing_face_class_rejects', lambda: normal_mutation(lambda r: r['faceClasses'].pop(), 'coverage','invalidClasses'))
    test('unknown_face_class_rejects', lambda: normal_mutation(lambda r: r['faceClasses'].__setitem__(0,'unknown'), 'coverage','invalidClasses'))
    test('planar_to_bevel_reclassification_rejects', lambda: normal_mutation(lambda r: r['faceClasses'].__setitem__(0,'bevel:casing'), 'coverage','classMismatch'))
    test('missing_group_rejects', lambda: normal_mutation(lambda r: r['groups'].pop(), 'coverage','groupSetMismatch'))
    test('duplicate_group_identity_rejects', lambda: normal_mutation(lambda r: r['groups'].append(copy.deepcopy(r['groups'][0])), 'coverage','duplicateIdentity'))
    test('unknown_group_rejects', lambda: normal_mutation(lambda r: r['groups'][0].update(id='unknown'), 'coverage','groupSetMismatch'))
    test('changed_group_range_rejects', lambda: normal_mutation(lambda r: r['groups'][0]['faceRange'].__setitem__(1,1), 'coverage','groupDeclarationMismatch'))
    def bad_expected_group(overlap):
        rows = copy.deepcopy(normal_rows); d = copy.deepcopy(normal_decl)
        if overlap:
            duplicate = copy.deepcopy(d['rows'][0]['groups'][0]); duplicate['id'] = 'other-id-overlapping-range'
            d['rows'][0]['groups'].append(duplicate); rows['shell-slab-fixture']['groups'].append(copy.deepcopy(duplicate))
            code = 'incompleteOrOverlappingGroupCoverage'
        else:
            d['rows'][0]['groups'][0]['triangleCount'] += 1
            rows['shell-slab-fixture']['groups'][0]['triangleCount'] += 1
            code = 'groupTriangleCountMismatch'
        return check_result(call(V, rows, d, sources), False, 'coverage', code)
    test('overlapping_group_ranges_even_in_pinned_fixture_reject', lambda: bad_expected_group(True))
    test('inconsistent_expected_triangle_count_rejects', lambda: bad_expected_group(False))

    # The long bevel is deliberately above the obsolete area threshold.
    normal = [0, math.sin(math.radians(15)), math.cos(math.radians(15))]
    strip = {'bevel-fixture': synthetic_row([[0,0,0],[.85,0,0],[.85,.0015,0],[0,.0015,0]], [[0,1,2,3]], ['bevel:casing'], [[normal]*4])}
    strip_decl = declaration(strip, sources)
    test('long_smooth_bevel_positive_despite_large_area', lambda: check_result(call(V, strip, strip_decl, sources), True))
    def flat_strip():
        rows = copy.deepcopy(strip); rows['bevel-fixture']['faceClasses'] = ['planar']
        d = declaration(rows, sources)
        return check_result(call(V, rows, d, sources), False, 'normalValidity', 'planarCornerAngle')
    test('same_long_strip_forced_planar_is_negative_control', flat_strip)
    def tiny_panel():
        tiny = {'tiny-planar': synthetic_row([[0,0,0],[.000001,0,0],[0,.000001,0]], [[0,1,2]], ['planar'], [[normal]*3])}
        return check_result(call(V, tiny, declaration(tiny,sources), sources), False, 'normalValidity', 'planarCornerAngle')
    test('tiny_planar_triangle_is_tested_regardless_of_area', tiny_panel)
    for key in ('groups', 'faces', 'vertices', 'faceClasses'):
        test('malformed_null_'+key+'_fails_closed', lambda key=key:
             normal_mutation(lambda r: r.__setitem__(key,None), 'coverage',
                             {'groups':'invalidList', 'faces':'faceCountMismatch', 'vertices':'invalidVertices', 'faceClasses':'invalidClasses'}[key]))
    def substitution(kind):
        rows = copy.deepcopy(normal_rows)
        r = rows['shell-slab-fixture']
        if kind == 'vertices':
            # Translation preserves topology and normal validity.
            for vertex in r['vertices']:
                vertex[0] += .001
        else:
            tilt(r, 1.0)  # Still geometrically valid; identity alone must reject.
        base_pin = FROZEN_FIXTURES['actual_authored_slab_classes_and_normals_positive']
        assert FROZEN_FIXTURES[CURRENT_TEST] == base_pin
        assert r['faces'] == normal_rows['shell-slab-fixture']['faces']
        assert r['groups'] == normal_rows['shell-slab-fixture']['groups']
        bound = dict(normal_decl, rowsSha256=base_pin['rowsSha256'])
        assert V.declaration_sha256(bound) == base_pin['declarationSha256']
        assert {k: hashlib.sha256(v).hexdigest() for k,v in sources.items()} == bound['sources']
        result = check_result(call(V, rows, normal_decl, sources), False, 'coverage', 'rowsPinMismatch')
        assert result['supportGeometry']['status'] == result['normalValidity']['status'] == 'not_run'
        result['payloadAssociationControl'] = {
            'sameTopology': True, 'unchangedSourceDigests': bound['sources'],
            'frozenDeclarationSha256': base_pin['declarationSha256'],
            'frozenRowsSha256': base_pin['rowsSha256'],
            'actualSubstitutedRowsSha256': V.rows_sha256(rows),
            'onlyRejection': result['coverage']['errors']}
        return result
    test('same_topology_vertex_substitution_frozen_pins_rejects', lambda: substitution('vertices'))
    test('same_topology_corner_normal_substitution_frozen_pins_rejects', lambda: substitution('normals'))
    def invalid_rows_pin(value):
        d = copy.deepcopy(normal_decl); d['rowsSha256'] = value
        return check_result(call(V, normal_rows, d, sources), False, 'coverage', 'missingOrInvalidRowsPin')
    test('null_rows_pin_rejects', lambda: invalid_rows_pin(None))
    test('malformed_rows_pin_rejects', lambda: invalid_rows_pin('not-a-sha256'))
    def missing_rows_pin():
        result = V.audit_m4_v3(normal_rows, normal_decl,
            expected_declaration_sha256=FROZEN_MISSING_ROWS_DECLARATION, source_bytes=sources)
        return check_result(result, False, 'coverage', 'missingOrInvalidRowsPin')
    test('absent_rows_pin_rejects', missing_rows_pin)
    def unpinned_new_payload_hash():
        d = copy.deepcopy(normal_decl); d['rowsSha256'] = '0'*64
        return check_result(call(V, normal_rows, d, sources,
            expected_pin('actual_authored_slab_classes_and_normals_positive')), False, 'coverage', 'declarationPinMismatch')
    test('caller_cannot_change_rows_pin_under_frozen_declaration', unpinned_new_payload_hash)
    def entire_payload_binding():
        seed = {'unicode': 'ÃƒÂ©', 'row': {'vertices': [[0.0, 1.0, 2.0]], 'faces': [[0,0,0]],
                'groups': [{'id':'g','reason':'fixture'}], 'faceClasses':['planar'],
                'cornerNormals': [[[0.0,0.0,1.0]]], 'extra': {'x': True}}}
        reference = hashlib.sha256(json.dumps(seed,sort_keys=True,separators=(',', ':'),ensure_ascii=False,allow_nan=False).encode('utf-8')).hexdigest()
        assert V.rows_sha256(seed) == reference
        assert V.rows_sha256(dict(reversed(list(seed.items())))) == reference
        for field in seed['row']:
            changed = copy.deepcopy(seed); changed['row'][field] = None
            assert V.rows_sha256(changed) != reference, field
        assert V.rows_sha256([0.0]) != V.rows_sha256([-0.0])
        assert V.rows_sha256([1]) != V.rows_sha256([1.0])
        for invalid in [float('nan'), float('inf'), float('-inf'), (1,2), np.array([1]), np.float64(1), {1:'bad'}, '\ud800']:
            try:
                V.rows_sha256(invalid)
            except (TypeError, ValueError, OverflowError):
                continue
            raise AssertionError('Invalid finite JSON type accepted')
        cyclic = []; cyclic.append(cyclic)
        try:
            V.rows_sha256(cyclic)
        except RecursionError:
            pass
        else:
            raise AssertionError('Cycle accepted')
        return {'completePayloadBound': True, 'finiteNativeTypesOnly': True, 'referenceDigest': reference}
    test('canonical_complete_finite_encoding_controls', entire_payload_binding)
    assert good_rows == baseline_copy and good_decl == baseline_decl, 'Verifier mutated inputs'
    after = protected_hashes()
    live_after = live_review_hashes()
    assert before == after, 'Protected inputs changed during focused checks'
    receipt = {'schema': 'm4-verifier-v3-writer-regressions/1', 'task': 'task_89c4c2160e32', 'dispatch': 'ctx_724054c5b1e7',
               'status': 'writer implementation evidence; independent review required; author integration held',
               'candidateAcceptance': False, 'fixtureDeclarationWarning': 'No complete approved candidate declaration was supplied or invented; fixture pins are test-only expectations.',
               'command': 'python -B design/studio-v2/scene-coordination/m4-v03-verifier-v3-tests.py'+(' --write' if '--write' in sys.argv else ''),
               'environment': {'python': platform.python_version(), 'numpy': np.__version__, 'platform': platform.platform()},
               'fullPlacementSearchRuns': 0, 'elapsedSeconds': time.monotonic()-start,
               'passed': not failures, 'testCount': len(tests), 'failures': failures, 'tests': tests, 'evidence': evidence,
               'hashesBefore': before, 'hashesAfter': after,
               'liveReviewHashesBefore': live_before, 'liveReviewHashesAfter': live_after,
               'liveReviewNote': 'Authorized concurrent Claude review pair; frozen interrupted snapshots remain immutable.',
               'frozenFixturePins': FROZEN_FIXTURES,
               'producerIntegration': 'UNSATISFIED for candidate; requires actual author declarations and independently reviewed pinned producer reproduction.',
               'implementationHashes': {'module': digest(HERE/'m4-v03-verifier-v3.py'), 'tests': digest(Path(__file__)), 'interface': digest(interface)}}
    print(json.dumps({'passed': not failures, 'testCount': len(tests), 'seconds': receipt['elapsedSeconds'], 'failures': failures}, indent=2))
    if '--write' in sys.argv:
        with OUT.open('x', encoding='utf-8', newline='\n') as f:
            json.dump(receipt, f, indent=2, allow_nan=False); f.write('\n')
        print('exclusiveReceiptSha256='+digest(OUT))
    return 0 if not failures else 1


if __name__ == '__main__':
    if sys.argv[1:] not in ([], ['--write']):
        raise SystemExit('Only --write is supported; it never overwrites an existing receipt')
    raise SystemExit(run())
