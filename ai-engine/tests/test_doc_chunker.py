from app.services.doc_chunker import (
    chunk_markdown,
    find_relevant_chunks,
    split_identifier,
)

DOC = """# Tong quan
He thong quan ly nguoi dung.

## createUser
Tao nguoi dung moi, nhan tham so name va email.

## deleteUser
Xoa nguoi dung theo id.

```
# khong phai heading
```
"""


def test_chunk_by_heading():
    chunks = chunk_markdown(DOC)
    headings = [c.heading for c in chunks]
    assert headings == ["Tong quan", "createUser", "deleteUser"]


def test_heading_inside_code_block_is_ignored():
    headings = [c.heading for c in chunk_markdown(DOC)]
    assert "khong phai heading" not in headings


def test_split_identifier():
    assert split_identifier("createUser") == ["create", "user"]
    assert split_identifier("get_user_by_id") == ["get", "user", "by", "id"]


def test_find_relevant_chunk_for_method():
    chunks = chunk_markdown(DOC)
    best_chunk, _ = find_relevant_chunks(chunks, "createUser")[0]
    assert best_chunk.heading == "createUser"