dir = "images/joker"
Dir.foreach(dir) do |f|
    next if f == '.' || f == '..'
    next unless f =~ /^[\d]+\.png/

    puts "rename: card_#{f}"
    File.rename File.join(dir, f), File.join(dir, "card_#{f}")
end
