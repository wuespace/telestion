def on_page_context(ctx, page, nav, **kwargs):
    if 'hide_edit_button' in page.meta and page.meta['hide_edit_button']:
        page.edit_url = ""
    return ctx