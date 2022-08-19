function loadPage(page) {
    $.ajax({
        url: '/user?page=' + page,
        type: 'GET',
    }).then((result) => {
        // trước khi render ra list khác cần ẩn toàn bộ list cũ
        $('#content').html('')
        for (let i = 0; i < result.data.length; i++) {
            const element = result.data[i]
            var item = `<h1>${element.username}</h1>`

            $('#content').append(item)
        }
    })
}

// Pagination
// document.addEventListener: khắc phục lỗi $ của jquery
document.addEventListener('DOMContentLoaded', function () {
    // luôn hiển thị 1 trang khi load web
    loadPage(1)
    $('#paging').pagination({
        // call đến api của 1 trang bất kì để lấy giá trị total
        dataSource: '/user?page=1',
        locator: 'data',
        totalNumberLocator: function (res) {
            return res.total
        },
        pageSize: 5,
        // lấy ra vị trí page được click
        afterPageOnClick: function (e, pageNumber) {
            loadPage(pageNumber)
        },
        afterPreviousOnClick: function (e, pageNumber) {
            loadPage(pageNumber)
        },
        afterNextOnClick: function (e, pageNumber) {
            loadPage(pageNumber)
        },
    })
})
