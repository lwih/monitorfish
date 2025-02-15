from datetime import datetime

import pandas as pd

from src.pipeline.shared_tasks.segments import (
    extract_all_segments,
    extract_segments_of_year,
    unnest_segments,
)


def test_extract_segments_of_year(reset_test_data):
    current_year = datetime.utcnow().year
    segments = extract_segments_of_year.run(current_year)

    expected_segments = pd.DataFrame(
        {
            "segment": ["SWW01/02/03", "SWW04"],
            "segment_name": ["Bottom trawls", "Midwater trawls"],
            "gears": [
                ["OTB", "OTT", "PTB", "OT", "PT", "TBN", "TBS", "TX", "TB"],
                ["OTM", "PTM"],
            ],
            "fao_areas": [["27.8.c", "27.8", "27.9"], ["27.8.c", "27.8"]],
            "species": [["ANF", "HKE", "LEZ", "MNZ", "NEP", "SOL"], ["HKE"]],
            "impact_risk_factor": [3.0, 2.1],
        }
    )

    pd.testing.assert_frame_equal(
        segments.sort_values("segment").reset_index(drop=True),
        expected_segments.sort_values("segment").reset_index(drop=True),
    )


def test_extract_all_segments(reset_test_data):
    segments = extract_all_segments.run()
    current_year = datetime.utcnow().year
    expected_segments = pd.DataFrame(
        {
            "year": [2022, 2022, current_year, current_year],
            "segment": ["SWW01/02/03 - 2022", "SWW04 - 2022", "SWW01/02/03", "SWW04"],
            "segment_name": [
                "Bottom trawls",
                "Midwater trawls",
                "Bottom trawls",
                "Midwater trawls",
            ],
            "gears": [
                ["OTB", "OTT", "PTB", "OT", "PT", "TBN", "TBS", "TX", "TB"],
                ["OTM", "PTM"],
                ["OTB", "OTT", "PTB", "OT", "PT", "TBN", "TBS", "TX", "TB"],
                ["OTM", "PTM"],
            ],
            "fao_areas": [
                ["27.8.c", "27.8", "27.9"],
                ["27.8.c", "27.8"],
                ["27.8.c", "27.8", "27.9"],
                ["27.8.c", "27.8"],
            ],
            "species": [
                ["ANF", "HKE", "LEZ", "MNZ", "NEP", "SOL"],
                ["HKE"],
                ["ANF", "HKE", "LEZ", "MNZ", "NEP", "SOL"],
                ["HKE"],
            ],
            "impact_risk_factor": [3.0, 2.1, 3.0, 2.1],
        }
    )

    pd.testing.assert_frame_equal(
        segments.sort_values(["year", "segment"]).reset_index(drop=True),
        expected_segments.sort_values(["year", "segment"]).reset_index(drop=True),
    )


def test_unnest_segments():
    segments_definitions = [
        [
            "A",
            [
                "OTB",
                "OTT",
            ],
            ["27.8.c", "27.8"],
            ["HKE", "SOL"],
        ],
        ["B", ["SDN"], [], []],
        ["C", [], ["27.8.c"], []],
        ["D", [], [], ["HKE"]],
        ["E", ["LL"], None, None],
    ]

    segments = pd.DataFrame(
        data=segments_definitions,
        columns=pd.Index(["segment", "gears", "fao_areas", "species"]),
    )

    segments = unnest_segments.run(segments)

    expected_segments = pd.DataFrame(
        {
            "segment": ["A", "A", "A", "A", "A", "A", "A", "A", "B", "C", "D", "E"],
            "gear": [
                "OTB",
                "OTB",
                "OTB",
                "OTB",
                "OTT",
                "OTT",
                "OTT",
                "OTT",
                "SDN",
                None,
                None,
                "LL",
            ],
            "fao_area": [
                "27.8.c",
                "27.8.c",
                "27.8",
                "27.8",
                "27.8.c",
                "27.8.c",
                "27.8",
                "27.8",
                None,
                "27.8.c",
                None,
                None,
            ],
            "species": [
                "HKE",
                "SOL",
                "HKE",
                "SOL",
                "HKE",
                "SOL",
                "HKE",
                "SOL",
                None,
                None,
                "HKE",
                None,
            ],
        }
    )

    pd.testing.assert_frame_equal(segments, expected_segments)
